import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/settingsService';
import { textAnalysisService } from '../services/textAnalysisService';
import { dictionaryService } from '../services/dictionaryService';
import type { Settings } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';
import { PlayCircleIcon } from '../components/icons/PlayCircleIcon';
import { StopCircleIcon } from '../components/icons/StopCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ClipboardDocumentIcon } from '../components/icons/ClipboardDocumentIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';
import { AdjustmentsHorizontalIcon } from '../components/icons/AdjustmentsHorizontalIcon';
import { ArchiveBoxArrowDownIcon } from '../components/icons/ArchiveBoxArrowDownIcon';
import { BookOpenIcon } from '../components/icons/BookOpenIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { PlayIcon } from '../components/icons/PlayIcon';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon';
import { BeakerIcon } from '../components/icons/BeakerIcon';

const DB_NAME = 'masmoo-tts-cache';
const STORE_NAME = 'audio-chunks';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) {
        dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }
    return dbPromise;
};

const saveChunkToDb = async (userId: string, chunkId: number, blob: Blob): Promise<void> => {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const key = `${userId}-${chunkId}`;
    store.put({ id: key, blob });
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

const getChunkFromDb = async (userId: string, chunkId: number): Promise<Blob | null> => {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const key = `${userId}-${chunkId}`;
    const request = store.get(key);
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result ? request.result.blob : null);
        request.onerror = () => reject(request.error);
    });
};

const clearAllUserChunksFromDb = async (userId: string): Promise<void> => {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.openCursor();
    return new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                if (String(cursor.key).startsWith(`${userId}-`)) {
                    cursor.delete();
                }
                cursor.continue();
            }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

type ConvertedChunk = {
  id: number;
  originalText: string;
  editedText: string;
  audioUrl?: string;
  blob?: Blob;
  status: 'pending' | 'converting' | 'success' | 'failed';
};

type SettingsTab = 'audio' | 'chunking' | 'keys';
type ResultsTab = 'chunks' | 'log';

const ExperimentalTextToSpeechPage: React.FC = () => {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  
  // States
  const [dbSettings, setDbSettings] = useState<Settings | null>(null);
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [newApiKeyInput, setNewApiKeyInput] = useState('');
  const [selectedApiKeys, setSelectedApiKeys] = useState<string[]>([]);
  const [apiKeyBalance, setApiKeyBalance] = useState<Record<string, number>>({});
  const [apiKeyStatus, setApiKeyStatus] = useState<Record<string, string>>({});
  const [fullText, setFullText] = useState<string>('');
  const [textChunks, setTextChunks] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentProcess, setCurrentProcess] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [logMessages, setLogMessages] = useState<Array<{message: string, level: string}>>([]);
  const [uiSettings, setUiSettings] = useState({
    voiceId: 'N2lVS1w4EtoT3dr4eOWO', modelId: 'eleven_multilingual_v2', stability: 0.45, similarityBoost: 0.75,
    speed: 1.0,
    chunkMin: 450 as number | string, chunkMax: 500 as number | string, startFrom: 1
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'warning' | 'error'} | null>(null);
  const [isCheckingBalances, setIsCheckingBalances] = useState(false);
  const [convertedChunks, setConvertedChunks] = useState<ConvertedChunk[]>([]);
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set());
  const [selectedForMerge, setSelectedForMerge] = useState<Set<number>>(new Set());
  const [isMerging, setIsMerging] = useState(false);
  const [invalidKeys, setInvalidKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showMultilingualWarning, setShowMultilingualWarning] = useState(false);
  
  const [selection, setSelection] = useState<{ text: string; chunkId: number } | null>(null);
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [dictReplacement, setDictReplacement] = useState('');

  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('audio');
  const [activeResultsTab, setActiveResultsTab] = useState<ResultsTab>('chunks');
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});
  const isDictModalOpenRef = useRef(isDictModalOpen);
  
  const [allVoices, setAllVoices] = useState<{ value: string; label: string }[]>([
      { value: "nPczCjzI2devNBz1zQrb", label: "Brian" }, 
      { value: "NFG5qt843uXKj4pFvR7C", label: "Adam Stone" }, 
      { value: "N2lVS1w4EtoT3dr4eOWO", label: "Callum" }
  ]);
  const models = [
    { value: 'eleven_multilingual_v3', label: t('tts.model.eleven_v3_alpha') },
    { value: 'eleven_multilingual_v2', label: t('tts.model.eleven_multilingual_v2') },
    { value: 'eleven_turbo_v2_5', label: t('tts.model.eleven_turbo_v2_5') },
    { value: 'eleven_flash_v2_5', label: t('tts.model.eleven_flash_v2_5') }
  ];
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(isRunning);
  const isUserScrolledUp = useRef(false);

  // --- Core Logic & Lifecycle ---

  useEffect(() => { isDictModalOpenRef.current = isDictModalOpen; }, [isDictModalOpen]);
  useEffect(() => { runningRef.current = isRunning; }, [isRunning]);

  useEffect(() => {
    const node = logContainerRef.current;
    if (node && !isUserScrolledUp.current) {
         node.scrollTop = node.scrollHeight;
    }
  }, [logMessages]);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const log = useCallback((message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages(prev => [...prev, { message: `[${timestamp}] ${message}`, level }]);
  }, []);

  const LOCAL_STORAGE_KEY = `tts-session-${user?.id}`;
  
  // Load data from DB and LocalStorage on mount
  useEffect(() => {
    const loadData = async () => {
        if(user) {
            setIsLoading(true);
            let settingsFromDb = await settingsService.getSettings(user.id);

            // Sanitize API keys on load
            const rawKeys = settingsFromDb.textToSpeech?.keys?.elevenlabs || [];
            const sanitizedKeys = [...new Set(rawKeys.map((k: any) => (typeof k === 'object' && k !== null && 'key' in k ? k.key : k)).filter((k: any): k is string => typeof k === 'string' && k.trim().length > 0).map(k => k.trim()))];
            
            setDbSettings(settingsFromDb);
            setApiKeys(sanitizedKeys);
            if (sanitizedKeys.length > 0) checkBalances(sanitizedKeys, true); // silent check on load
            
            // Combine default and custom voices
            const defaultVoices = [
                { value: "nPczCjzI2devNBz1zQrb", label: "Brian" },
                { value: "NFG5qt843uXKj4pFvR7C", label: "Adam Stone" },
                { value: "N2lVS1w4EtoT3dr4eOWO", label: "Callum" }
            ];
            const customVoices = settingsFromDb.textToSpeech?.customVoices?.map(v => ({
                value: v.voice_id,
                label: `${v.name} [Custom]`
            })) || [];
            setAllVoices([...defaultVoices, ...customVoices]);

            // Load session from local storage
            const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedStateJSON) {
                try {
                    const savedState = JSON.parse(savedStateJSON);
                    setFullText(savedState.fullText || '');
                    setUiSettings(savedState.uiSettings || uiSettings);
                    setLogMessages(savedState.logMessages || []);
                    const chunksFromStorage: ConvertedChunk[] = (savedState.convertedChunks || []);
                    if (chunksFromStorage.length > 0) {
                        Promise.all(chunksFromStorage.map(async (chunk: ConvertedChunk): Promise<ConvertedChunk> => {
                            if (chunk.status === 'success' && user?.id) {
                                const blob = await getChunkFromDb(user.id, chunk.id);
                                if (blob) {
                                    return { ...chunk, blob, audioUrl: URL.createObjectURL(blob) };
                                }
                                return { ...chunk, status: 'pending', blob: undefined, audioUrl: undefined };
                            }
                            return chunk;
                        })).then(updatedChunks => setConvertedChunks(updatedChunks));
                    } else {
                        setConvertedChunks([]);
                    }
                } catch (e) { console.error("Failed to parse saved session", e); }
            }
            
            setIsLoading(false);
        }
    };
    loadData();
  }, [user, LOCAL_STORAGE_KEY]);

  // Save session to local storage on changes
  useEffect(() => {
      if (user && !isLoading) {
          const stateToSave = {
              fullText,
              uiSettings,
              logMessages,
              convertedChunks: convertedChunks.map(({ blob, audioUrl, ...rest }) => rest)
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      }
  }, [fullText, uiSettings, logMessages, convertedChunks, user, isLoading, LOCAL_STORAGE_KEY]);
  
  const handleClearSession = useCallback(async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (user) {
        await clearAllUserChunksFromDb(user.id);
    }
    setFullText('');
    setLogMessages([]);
    setConvertedChunks([]);
    setProgress(0);
    setCurrentProcess(0);
    showToast(t('tts.session.cleared'));
  }, [user, t, LOCAL_STORAGE_KEY]);

  // This is the fix: handle incoming text from TextCheckPage
  useEffect(() => {
    const textToLoad = location.state?.textToConvert;
    if (textToLoad && user) {
      // Manually clear the session state EXCEPT for the text input itself,
      // to prepare for the new text.
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      clearAllUserChunksFromDb(user.id);
      setLogMessages([]);
      setConvertedChunks([]);
      setProgress(0);
      setCurrentProcess(0);
      
      // Now, set the new text from the location state.
      setFullText(textToLoad);
      log(t('tts.general.log.textLoadedFromCheck'), 'success');
      
      // Clean up location state to prevent re-loading on refresh.
      window.history.replaceState({}, document.title);
    }
  }, [location.state, user, log, t, LOCAL_STORAGE_KEY]);
  
  useEffect(() => {
    setShowMultilingualWarning(!uiSettings.modelId.includes('multilingual'));
  }, [uiSettings.modelId]);


  // --- API Key Management ---

  const updateAndSaveKeys = async (newKeys: string[]) => {
      if (!user || !dbSettings) return;
      const updatedSettings: Settings = { ...dbSettings, textToSpeech: { ...dbSettings.textToSpeech, keys: { ...dbSettings.textToSpeech?.keys, elevenlabs: newKeys } } };
      setApiKeys(newKeys);
      setDbSettings(updatedSettings);
      try { await settingsService.saveSettings(user.id, updatedSettings); } 
      catch (e) { log('Failed to save keys.', 'error'); setApiKeys(dbSettings.textToSpeech?.keys?.elevenlabs || []); setDbSettings(dbSettings); }
  };

  const handleAddNewKey = async () => {
    if (!newApiKeyInput.trim()) return showToast(t('tts.apiKeyManagement.toast.enterKey'), 'warning');
    const keyToAdd = newApiKeyInput.trim();
    if (apiKeys.includes(keyToAdd)) return showToast(t('tts.apiKeyManagement.toast.keyExists'), 'warning');
    const newKeys = [...apiKeys, keyToAdd];
    await updateAndSaveKeys(newKeys);
    log(t('tts.apiKeyManagement.log.keyAdded', { key: keyToAdd.substring(0, 4) }), 'success');
    checkBalanceForKey(keyToAdd);
    setNewApiKeyInput('');
  };

  const deleteSelectedKeys = async () => {
    if (selectedApiKeys.length === 0) return showToast(t('tts.apiKeyManagement.toast.selectKeyToDelete'), 'warning');
    const newKeys = apiKeys.filter(k => !selectedApiKeys.includes(k));
    await updateAndSaveKeys(newKeys);
    log(t('tts.apiKeyManagement.log.keysDeleted', { count: selectedApiKeys.length }), 'warning');
    setSelectedApiKeys([]);
  };

  const deleteAllKeys = async () => {
    if (window.confirm(t('tts.apiKeyManagement.toast.confirmDeleteAll'))) {
        await updateAndSaveKeys([]);
        setSelectedApiKeys([]); setApiKeyBalance({}); setApiKeyStatus({});
        log(t('tts.apiKeyManagement.log.allKeysDeleted'), 'error');
    }
  };

  const handleSelectKey = (key: string, isChecked: boolean) => setSelectedApiKeys(prev => isChecked ? [...prev, key] : prev.filter(k => k !== key));
  const handleSelectAllKeys = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedApiKeys(e.target.checked ? apiKeys : []);

  const checkBalanceForKey = async (apiKey: string, silent = false) => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        const balance = (data.subscription?.character_limit || 0) - (data.subscription?.character_count || 0);
        setApiKeyBalance(prev => ({ ...prev, [apiKey]: balance }));
        setApiKeyStatus(prev => ({ ...prev, [apiKey]: balance > 0 ? t('tts.apiKeyManagement.status.active') : t('tts.apiKeyManagement.status.inactive') }));
        if (!silent) log(t('tts.apiKeyManagement.log.validKey', { key: apiKey.substring(0, 4), balance: balance.toLocaleString() }), 'success');
      } else {
        const errorMsg = analyzeApiError(response, apiKey);
        if (!silent) log(t('tts.apiKeyManagement.log.balanceCheckFailed', { error: errorMsg }), 'error');
        setApiKeyStatus(prev => ({ ...prev, [apiKey]: t('tts.apiKeyManagement.status.error') }));
        if(response.status === 401) {
             setApiKeyBalance(prev => ({ ...prev, [apiKey]: 0 }));
             setApiKeyStatus(prev => ({ ...prev, [apiKey]: t('tts.apiKeyManagement.status.inactive') }));
        }
      }
    } catch (error) { if (!silent) log(t('tts.apiKeyManagement.log.balanceCheckFailed', { error }), 'error'); setApiKeyStatus(prev => ({ ...prev, [apiKey]: t('tts.apiKeyManagement.status.error') })); }
  };
  
  const checkBalances = async (keys: string[], silent = false) => {
    if (!keys || keys.length === 0) return showToast(t('tts.apiKeyManagement.toast.noKeysToCheck'), 'warning');
    setInvalidKeys(new Set());
    setIsCheckingBalances(true);
    if (!silent) log(t('tts.apiKeyManagement.log.checkingBalances'), 'info');
    for (const key of keys) {
      await checkBalanceForKey(key, silent);
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
    setIsCheckingBalances(false);
  };

  const analyzeApiError = (response: Response, apiKey: string): string => {
      const keyInfo = `Key: ${apiKey.substring(0, 4)}...`;
      switch (response.status) {
        case 401: return `Invalid API key. ${keyInfo}`;
        case 429: return `Rate limit exceeded. ${keyInfo}`;
        case 400: return `Invalid request data. ${keyInfo}`;
        default: return `API Error (${response.status}) - ${keyInfo}`;
      }
    };

  const loadKeysFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const newKeys = (e.target?.result as string).split('\n').map(k => k.trim()).filter(Boolean);
      const addedKeys = newKeys.filter(key => !apiKeys.includes(key));
      if (addedKeys.length > 0) {
        await updateAndSaveKeys([...apiKeys, ...addedKeys]);
        log(t('tts.apiKeyManagement.log.keysUploaded', { count: addedKeys.length }), 'success'); checkBalances(addedKeys);
      } else { showToast(t('tts.apiKeyManagement.toast.noNewKeys'), 'warning'); }
    };
    reader.readAsText(file);
  };
  
  // --- Text & Chunking Logic ---

  const splitText = (text: string): string[] => {
    const min = parseInt(String(uiSettings.chunkMin)) || 450;
    const max = parseInt(String(uiSettings.chunkMax)) || 500;
    if (!text || text.trim().length === 0) return [];
    if (min >= max || min <= 0) return [text];
    const chunks: string[] = [];
    let remainingText = text.trim();
    while (remainingText.length > 0) {
        if (remainingText.length <= max) { chunks.push(remainingText); break; }
        let splitPos = -1;
        for (let i = Math.min(max, remainingText.length - 1); i >= min; i--) { if (/[.؟!؟]/.test(remainingText[i])) { splitPos = i + 1; break; } }
        if (splitPos === -1) { const lastSpace = remainingText.lastIndexOf(' ', max); if (lastSpace !== -1 && lastSpace >= min) { splitPos = lastSpace + 1; } }
        if (splitPos === -1) { splitPos = max; }
        chunks.push(remainingText.substring(0, splitPos).trim());
        remainingText = remainingText.substring(splitPos).trim();
    }
    if (chunks.length > 1) {
        const lastChunk = chunks[chunks.length - 1];
        if (lastChunk.length > 0 && lastChunk.length < min) {
            const secondLastChunk = chunks[chunks.length - 2];
            if ((secondLastChunk.length + lastChunk.length) < (max * 1.5)) { chunks[chunks.length - 2] = secondLastChunk + ' ' + lastChunk; chunks.pop(); }
        }
    }
    return chunks.filter(chunk => chunk.length > 0);
  };

  useEffect(() => {
    const newChunks = splitText(fullText);
    setTextChunks(newChunks);
  }, [fullText, uiSettings.chunkMin, uiSettings.chunkMax]);
  
  const handleChunkSizeChange = (field: 'min' | 'max', value: string) => setUiSettings(prev => ({ ...prev, [field === 'min' ? 'chunkMin' : 'chunkMax']: value }));
  const handleChunkSizeBlur = (field: 'min' | 'max') => {
    setUiSettings(prev => {
      let numMin = parseInt(String(prev.chunkMin), 10);
      let numMax = parseInt(String(prev.chunkMax), 10);
      if (isNaN(numMin)) numMin = 450; if (isNaN(numMax)) numMax = 500;
      numMin = Math.max(1, numMin);
      if (numMax <= numMin) { if (field === 'max') { numMin = Math.max(1, numMax - 1); } else { numMax = numMin + 1; } }
      if (numMax <= numMin) numMax = numMin + 1;
      return { ...prev, chunkMin: numMin, chunkMax: numMax };
    });
  };

  const selectTextFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      handleClearSession();
      setFullText(content);
      log(t('tts.general.log.textSelected', { name: file.name }), 'success');
    };
    reader.readAsText(file);
  };

  const handleEnhanceText = async () => {
    if (!user || !dbSettings || !fullText) return;
    setIsEnhancing(true);
    log(t('tts.enhance.log.start'));

    const apiKey = dbSettings.aiModels.keys.gemini;

    if (!apiKey) {
        log(t('textCheck.error.noApiKey'), 'error');
        showToast(t('textCheck.error.noApiKey'), 'error');
        setIsEnhancing(false);
        return;
    }

    try {
        const enhancedText = await textAnalysisService.enhanceText(fullText, apiKey);
        setFullText(enhancedText);
        log(t('tts.enhance.log.success'), 'success');
        showToast(t('tts.enhance.success'), 'success');
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        log(`Enhancement failed: ${errorMessage}`, 'error');
        showToast(t('tts.enhance.error'), 'error');
    } finally {
        setIsEnhancing(false);
    }
  };
  
  // --- TTS Core & Conversion Flow ---

  const textToSpeech = async (text: string, voiceIdOverride?: string): Promise<{ success: boolean; audioUrl?: string; audioBlob?: Blob }> => {
    const sortedKeys = [...apiKeys].sort((a, b) => (apiKeyBalance[b] || 0) - (apiKeyBalance[a] || 0));
    const availableKeys = sortedKeys.filter(key => (apiKeyBalance[key] || 0) > 0 && !invalidKeys.has(key));

    if (availableKeys.length === 0) { log(t('tts.general.log.noValidKeys'), 'warning'); return { success: false }; }

    for (const key of availableKeys) {
        if (!runningRef.current && !voiceIdOverride) return { success: false };
        try {
            if (!voiceIdOverride) log(t('tts.general.log.tryingKey', { key: key.substring(0, 4), balance: (apiKeyBalance[key] || 0).toLocaleString() }), 'info');
            const requestBody: any = { text, model_id: uiSettings.modelId, };
            if (uiSettings.modelId === 'eleven_multilingual_v2') { requestBody.voice_settings = { stability: uiSettings.stability, similarity_boost: uiSettings.similarityBoost }; }
            if (uiSettings.modelId === 'eleven_multilingual_v3') { requestBody.speed = uiSettings.speed; }

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceIdOverride || uiSettings.voiceId}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': key, 'Accept': 'audio/mpeg' },
                body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                if (!voiceIdOverride) {
                  const newBalance = Math.max(0, (apiKeyBalance[key] || 0) - text.length);
                  setApiKeyBalance(prev => ({ ...prev, [key]: newBalance }));
                  if(newBalance <= 0) setApiKeyStatus(prev => ({ ...prev, [key]: t('tts.apiKeyManagement.status.inactive') }));
                }
                return { success: true, audioUrl, audioBlob };
            } else {
                const errorMessage = analyzeApiError(response, key);
                if (!voiceIdOverride) log(t('tts.general.log.apiFail', { error: errorMessage }), 'error');
                if (response.status === 401) {
                    setInvalidKeys(prev => new Set(prev).add(key));
                    if (!voiceIdOverride) log(t('tts.general.log.keyMarkedInvalid', { key: key.substring(0, 4) }), 'warning');
                }
            }
        } catch (error) { if (!voiceIdOverride) log(t('tts.general.log.networkError', { error }), 'error'); }
    }
    return { success: false };
  };

  const previewVoice = async (voiceId: string) => {
    setIsPreviewingVoice(true);
    const sampleText = language === 'ar' ? 'أهلاً بك، هذا مثال على صوتي.' : 'Hello, this is a sample of my voice.';
    const result = await textToSpeech(sampleText, voiceId);
    if (result.success && result.audioBlob) {
        const audio = new Audio(URL.createObjectURL(result.audioBlob));
        audio.play();
    } else {
        showToast(t('tts.error.voicePreviewFailed'), 'error');
    }
    setIsPreviewingVoice(false);
  };
    
  const startConversion = async () => {
    if (!fullText || textChunks.length === 0) return showToast(t('tts.general.toast.selectTextFirst'), 'warning');
    if (apiKeys.length === 0) return showToast(t('tts.general.toast.addKeyFirst'), 'warning');

    setInvalidKeys(new Set());
    setIsRunning(true); runningRef.current = true; setProgress(0); setConvertedChunks([]); setSelectedForMerge(new Set());
    let success = 0, fail = 0;
    
    const initialChunks: ConvertedChunk[] = textChunks.map((chunkText, index) => ({ id: index + 1, originalText: chunkText, editedText: chunkText, status: 'pending' }));
    setConvertedChunks(initialChunks);

    for (let i = 0; i < initialChunks.length; i++) {
        if (!runningRef.current) break;
        const chunk = initialChunks[i];
        if (chunk.id < uiSettings.startFrom) continue;
        setCurrentProcess(chunk.id); setProgress(((i + 1) / textChunks.length) * 100);
        setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, status: 'converting' } : c));
        log(t('tts.general.log.convertingChunk', { current: chunk.id, total: textChunks.length }), 'info');

        const result = await textToSpeech(chunk.editedText);
        if (!runningRef.current) break;

        if (result.success && result.audioUrl && result.audioBlob) { 
            log(t('tts.general.log.chunkSuccess', { id: chunk.id }), 'success');
            if (user) {
                await saveChunkToDb(user.id, chunk.id, result.audioBlob);
            }
            setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, status: 'success', audioUrl: result.audioUrl, blob: result.audioBlob } : c));
            success++;
        }
        else {
            log(t('tts.general.log.chunkFail', { id: chunk.id }), 'error');
            setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, status: 'failed' } : c));
            fail++;
        }
    }
    log(t('tts.general.log.conversionComplete', { success, fail }), success > fail ? 'success' : 'error');
    setIsRunning(false); runningRef.current = false;
  };
  
  const handleRetryChunk = async (chunkId: number) => {
    const chunkToRetry = convertedChunks.find(c => c.id === chunkId);
    if (!chunkToRetry || !user) return;
    runningRef.current = true;
    log(t('tts.general.log.retryingChunk', { id: chunkId }), 'info');
    setConvertedChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'converting' } : c));
    const result = await textToSpeech(chunkToRetry.editedText);
    runningRef.current = isRunning;
    if (result.success && result.audioUrl && result.audioBlob) {
        log(t('tts.general.log.retrySuccess', { id: chunkId }), 'success');
        await saveChunkToDb(user.id, chunkId, result.audioBlob);
        setConvertedChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'success', audioUrl: result.audioUrl, blob: result.audioBlob } : c));
    } else {
        log(t('tts.general.log.retryFail', { id: chunkId }), 'error');
        setConvertedChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'failed' } : c));
    }
  };
  
  // --- UI Handlers & Helpers ---
  
  const handleLogScroll = () => {
    const node = logContainerRef.current;
    if (node) { isUserScrolledUp.current = !(node.scrollHeight - node.scrollTop - node.clientHeight < 10); }
  };

  const toggleChunkExpansion = (chunkId: number) => setExpandedChunks(prev => { const newSet = new Set(prev); if (newSet.has(chunkId)) newSet.delete(chunkId); else newSet.add(chunkId); return newSet; });
  const stopConversion = () => { setIsRunning(false); runningRef.current = false; log(t('tts.general.log.conversionStopped'), 'warning'); };
  const copyLogToClipboard = () => navigator.clipboard.writeText(logMessages.map(msg => msg.message).join('\n')).then(() => showToast(t('tts.toast.logCopied'))).catch(err => log(t('tts.general.log.logCopiedFail', { error: err }), 'error'));
  const exportLogToFile = () => { const blob = new Blob([logMessages.map(msg => msg.message).join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `log_${new Date().toISOString()}.txt`; a.click(); URL.revokeObjectURL(url); log(t('tts.general.log.logExported'), 'success'); };
  const clearLog = () => { setLogMessages([]); log(t('tts.general.log.logCleared'), 'info'); };
  const handleResetAdvancedSettings = () => { setUiSettings(s => ({ ...s, voiceId: 'N2lVS1w4EtoT3dr4eOWO', modelId: 'eleven_multilingual_v2', stability: 0.45, similarityBoost: 0.75, speed: 1.0 })); showToast(t('tts.toast.defaultsRestored'), 'success'); };

  const handleTextSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>, chunkId: number) => {
    const textarea = e.currentTarget; const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd).trim();
    if (selectedText && selectedText.length > 0 && selectedText.length < 100) { setSelection({ text: selectedText, chunkId }); }
  };
  const handleTextareaBlur = (chunkId: number) => { setTimeout(() => { if (selection?.chunkId === chunkId && !isDictModalOpenRef.current) setSelection(null); }, 200); };
  const handleOpenDictModal = () => { if (selection) setIsDictModalOpen(true); };
  const handleCloseDictModal = () => { setIsDictModalOpen(false); setSelection(null); setDictReplacement(''); };
  const handleAddToDictionary = async () => {
    if (!user || !selection || !dictReplacement.trim()) return;
    try {
        await dictionaryService.addWord(user.id, selection.text, dictReplacement.trim());
        showToast(t('tts.addToDictionary.success'), 'success'); log(t('tts.addToDictionary.log', { original: selection.text, replacement: dictReplacement.trim() }), 'success');
        handleCloseDictModal();
    } catch (e) { log(t('tts.addToDictionary.error') + `: ${(e as Error).message}`, 'error'); showToast(t('tts.addToDictionary.error'), 'error'); }
  };

  // --- Merging Logic ---
  
  const handleMergeAndDownload = async () => {
    const blobsToMerge = convertedChunks.filter(c => selectedForMerge.has(c.id) && c.blob).sort((a, b) => a.id - b.id).map(c => c.blob!);
    if (blobsToMerge.length < 1) return showToast(t('tts.toast.selectToMerge'), "warning");
    setIsMerging(true); log(t('tts.general.log.mergeStart'), "info");
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffers = await Promise.all(blobsToMerge.map(b => b.arrayBuffer().then(ab => audioContext.decodeAudioData(ab))));
        const totalLength = decodedBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
        const mergedBuffer = audioContext.createBuffer(1, totalLength, decodedBuffers[0].sampleRate);
        let offset = 0;
        for (const buffer of decodedBuffers) { mergedBuffer.getChannelData(0).set(buffer.getChannelData(0), offset); offset += buffer.length; }
        const wavBlob = audioBufferToWav(mergedBuffer);
        const url = URL.createObjectURL(wavBlob); const a = document.createElement('a'); a.href = url; a.download = 'merged_audio.wav'; a.click(); URL.revokeObjectURL(url);
        log(t('tts.general.log.mergeSuccess'), "success");
    } catch(e: any) { log(t('tts.general.log.mergeFail', { error: e.toString() }), 'error'); }
    setIsMerging(false);
  };
  const audioBufferToWav = (buffer: AudioBuffer): Blob => { /* ... (implementation unchanged) ... */ const numOfChan = buffer.numberOfChannels, len = buffer.length * numOfChan * 2 + 44, abuffer = new ArrayBuffer(len), view = new DataView(abuffer), channels = [], sampleRate = buffer.sampleRate; let offset = 0, pos = 0; const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; }; const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; }; setUint32(0x46464952); setUint32(len - 8); setUint32(0x45564157); setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan); setUint32(sampleRate); setUint32(sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(len - pos - 4); for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i)); while (pos < len) { for (let i = 0; i < numOfChan; i++) { let sample = Math.max(-1, Math.min(1, channels[i][offset])); sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; view.setInt16(pos, sample, true); pos += 2; } offset++; } return new Blob([view], { type: 'audio/wav' }); };

  // --- Render-related calculations ---

  const totalBalance = Object.values(apiKeyBalance).reduce((sum: number, bal: number) => {
    const numericBal = Number(bal);
    return sum + (Number.isNaN(numericBal) ? 0 : Math.max(0, numericBal));
  }, 0);
  const successfulChunks = convertedChunks.filter(c => c.status === 'success');
  const isSelectAllForMergeChecked = successfulChunks.length > 0 && selectedForMerge.size === successfulChunks.length;
  const handleSelectAllForMerge = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedForMerge(e.target.checked ? new Set(successfulChunks.map(c => c.id)) : new Set());
  const areVoiceSettingsSupported = uiSettings.modelId === 'eleven_multilingual_v2';
  const getTabClass = (tabName: SettingsTab | ResultsTab, activeTab: SettingsTab | ResultsTab) => `px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${activeTab === tabName ? 'border-highlight text-highlight' : 'border-transparent text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'}`;
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-highlight dark:border-dark-highlight"></div></div>;
  }

  return (
    <div className="space-y-6">
      {toast && ( <div className={`fixed top-24 end-8 p-4 rounded-lg shadow-lg text-white z-50 ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}>{toast.message}</div> )}
      {isDictModalOpen && selection && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={handleCloseDictModal}>
            <div className="bg-secondary dark:bg-dark-secondary rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{t('tts.addToDictionary.title')}</h3>
                <div className="space-y-4">
                    <div> <label className="block text-sm font-bold mb-1">{t('dictionary.add.original')}</label> <input type="text" value={selection.text} readOnly className="w-full p-2 bg-accent dark:bg-dark-accent rounded-md cursor-not-allowed opacity-70" /> </div>
                    <div> <label className="block text-sm font-bold mb-1" htmlFor="dict-replacement">{t('dictionary.add.replacement')}</label> <input id="dict-replacement" type="text" value={dictReplacement} onChange={e => setDictReplacement(e.target.value)} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight" autoFocus /> </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={handleCloseDictModal} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('planManagement.cancel')}</button>
                    <button onClick={handleAddToDictionary} disabled={!dictReplacement.trim()} className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('dictionary.add.button')}</button>
                </div>
            </div>
        </div>
      )}

      <h1 className="text-3xl font-bold flex items-center gap-2"> <BeakerIcon className="w-8 h-8 text-highlight dark:text-dark-highlight" /> <span>{t('experimentalTts.title')}</span> </h1>

      <Card title={t('tts.configuration.title')} headerActions={<button onClick={handleClearSession} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('tts.session.clear')}</button>}>
        <div className="space-y-4">
            <textarea value={fullText} onChange={(e) => setFullText(e.target.value)} rows={8} className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg" placeholder={t('tts.controls.placeholder')} />
            <div className="flex gap-2">
                <label className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-1 flex items-center justify-center gap-2"> <ArrowUpTrayIcon className="w-5 h-5"/> <span>{t('textCheck.button.upload')}</span> <input type="file" accept=".txt" className="hidden" onChange={e => e.target.files && selectTextFile(e.target.files[0])} /> </label>
                <button onClick={handleEnhanceText} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2" disabled={isEnhancing || !fullText}> <SparklesIcon className="w-5 h-5"/> <span>{isEnhancing ? t('tts.enhance.enhancing') : t('tts.configuration.enhanceWithAI')}</span> </button>
            </div>
        </div>
        <div className="mt-6">
            <div className="border-b border-accent dark:border-dark-accent"><nav className="-mb-px flex space-x-4">
                <button onClick={() => setActiveSettingsTab('audio')} className={getTabClass('audio', activeSettingsTab)}>{t('tts.tabs.audioSettings')}</button>
                <button onClick={() => setActiveSettingsTab('chunking')} className={getTabClass('chunking', activeSettingsTab)}>{t('tts.tabs.chunking')}</button>
                <button onClick={() => setActiveSettingsTab('keys')} className={getTabClass('keys', activeSettingsTab)}>{t('tts.tabs.apiKeys')}</button>
            </nav></div>
            <div className="pt-6">
                {activeSettingsTab === 'audio' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Select label={t('tts.settings.voice')} options={allVoices} value={uiSettings.voiceId} onChange={e => setUiSettings(s => ({...s, voiceId: e.target.value}))} />
                            <button onClick={() => previewVoice(uiSettings.voiceId)} disabled={isPreviewingVoice} className="text-sm bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 w-full">{isPreviewingVoice ? t('tts.voice.previewing') : t('tts.voice.preview')}</button>
                        </div>
                        <div className="sm:col-span-2"><Select label={t('tts.settings.model')} options={models} value={uiSettings.modelId} onChange={e => setUiSettings(s => ({...s, modelId: e.target.value}))} /> {showMultilingualWarning && (<p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 px-1 flex items-center gap-1"><InformationCircleIcon className="w-4 h-4" /> {t('tts.model.nonMultilingualWarning')}</p>)}</div>
                        <Input containerClassName="sm:col-span-2" label={t('tts.voiceTuning.stability')} type="range" min="0" max="1" step="0.01" value={uiSettings.stability} onChange={e => setUiSettings(s => ({...s, stability: parseFloat(e.target.value)}))} title={areVoiceSettingsSupported ? String(uiSettings.stability) : t('tts.voiceTuning.unavailable')} disabled={!areVoiceSettingsSupported}/>
                        <Input containerClassName="sm:col-span-2" label={t('tts.voiceTuning.similarityBoost')} type="range" min="0" max="1" step="0.01" value={uiSettings.similarityBoost} onChange={e => setUiSettings(s => ({...s, similarityBoost: parseFloat(e.target.value)}))} title={areVoiceSettingsSupported ? String(uiSettings.similarityBoost) : t('tts.voiceTuning.unavailable')} disabled={!areVoiceSettingsSupported}/>
                        <Input containerClassName="sm:col-span-2" label={t('tts.advancedAudio.speed')} type="range" min="0.5" max="2.0" step="0.05" value={uiSettings.speed} onChange={e => setUiSettings(s => ({...s, speed: parseFloat(e.target.value)}))} title={uiSettings.modelId === 'eleven_multilingual_v3' ? `${uiSettings.speed.toFixed(2)}x` : t('tts.advancedAudio.speed.unavailable')} disabled={uiSettings.modelId !== 'eleven_multilingual_v3'}/>
                        <div className="sm:col-span-2 flex justify-between items-center">
                          <Link to="/ssml-guide" className="text-sm text-highlight dark:text-dark-highlight hover:underline flex items-center gap-1.5">
                            <InformationCircleIcon className="w-5 h-5"/>
                            {t('tts.ssmlGuideLink')}
                          </Link>
                          <button type="button" onClick={handleResetAdvancedSettings} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('tts.advancedAudio.resetDefaults')}</button>
                        </div>
                    </div>
                )}
                {activeSettingsTab === 'chunking' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div><dt className="text-sm text-text-secondary">{t('tts.statsAndSettings.totalChars')}</dt><dd className="text-lg font-bold">{fullText.length.toLocaleString()}</dd></div>
                            <div><dt className="text-sm text-text-secondary">{t('tts.statsAndSettings.chunkCount')}</dt><dd className="text-lg font-bold">{textChunks.length.toLocaleString()}</dd></div>
                            <div><dt className="text-sm text-text-secondary">{t('tts.statsAndSettings.totalKeys')}</dt><dd className="text-lg font-bold">{apiKeys.length}</dd></div>
                            <div><dt className="text-sm text-text-secondary">{t('tts.statsAndSettings.totalBalance')}</dt><dd className="text-lg font-bold">{totalBalance.toLocaleString()}</dd></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-accent dark:border-dark-accent pt-4">
                            <Input label={t('tts.statsAndSettings.chunkMin')} type="number" value={uiSettings.chunkMin} onChange={e => handleChunkSizeChange('min', e.target.value)} onBlur={() => handleChunkSizeBlur('min')}/>
                            <Input label={t('tts.statsAndSettings.chunkMax')} type="number" value={uiSettings.chunkMax} onChange={e => handleChunkSizeChange('max', e.target.value)} onBlur={() => handleChunkSizeBlur('max')}/>
                            <Input label={t('tts.statsAndSettings.startFrom')} type="number" value={uiSettings.startFrom} onChange={e => setUiSettings(s => ({...s, startFrom: parseInt(e.target.value) || 1}))} min="1"/>
                        </div>
                    </div>
                )}
                {activeSettingsTab === 'keys' && (
                    <div className="space-y-4">
                      <div className="flex gap-2"><input type="password" value={newApiKeyInput} onChange={(e) => setNewApiKeyInput(e.target.value)} placeholder={t('tts.apiKeyManagement.enterNew')} className="flex-grow px-3 py-2 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-accent dark:border-dark-accent focus:outline-none focus:ring-2 focus:ring-highlight dark:focus:ring-dark-highlight"/><button onClick={handleAddNewKey} className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('tts.apiKeyManagement.add')}</button></div>
                      <div className="flex flex-wrap gap-2 border-t border-accent dark:border-dark-accent pt-4">
                          <button onClick={() => checkBalances(apiKeys)} disabled={isCheckingBalances} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isCheckingBalances ? t('tts.apiKeyManagement.checking') : t('tts.apiKeyManagement.checkAll')}</button>
                          <label className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"> <ArrowUpTrayIcon className="w-5 h-5"/> <span>{t('tts.apiKeyManagement.uploadKeys')}</span> <input type="file" accept=".txt" className="hidden" onChange={(e) => e.target.files && loadKeysFromFile(e.target.files[0])} /> </label>
                          <div className="flex-grow"></div>
                          <button onClick={deleteSelectedKeys} disabled={selectedApiKeys.length === 0} className="bg-transparent text-red-500 border border-red-500 font-medium py-2 px-4 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:text-red-500/50 disabled:border-red-500/50 disabled:bg-transparent flex items-center gap-2"> <TrashIcon className="w-5 h-5"/> <span>{t('tts.apiKeyManagement.deleteSelected', { count: selectedApiKeys.length })}</span> </button>
                          <button onClick={deleteAllKeys} disabled={apiKeys.length === 0} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('tts.apiKeyManagement.deleteAll')}</button>
                      </div>
                      <div className="overflow-x-auto max-h-64"><table className="w-full text-sm text-left">
                          <thead className="text-xs uppercase bg-accent dark:bg-dark-accent sticky top-0"><tr><th className="p-2"><input type="checkbox" onChange={handleSelectAllKeys} checked={apiKeys.length > 0 && selectedApiKeys.length === apiKeys.length} /></th><th className="p-2">#</th><th className="p-2">{t('tts.apiKeyManagement.table.key')}</th><th className="p-2">{t('tts.apiKeyManagement.table.balance')}</th><th className="p-2">{t('tts.apiKeyManagement.table.status')}</th></tr></thead>
                          <tbody>{apiKeys.map((key, index) => (<tr key={key} className="border-b border-accent dark:border-dark-accent"><td className="p-2"><input type="checkbox" value={key} checked={selectedApiKeys.includes(key)} onChange={(e) => handleSelectKey(key, e.target.checked)} /></td><td className="p-2">{index + 1}</td><td className="p-2 font-mono">{`${key.substring(0, 4)}...${key.substring(key.length - 4)}`}</td><td className="p-2">{apiKeyBalance[key]?.toLocaleString() ?? '...'}</td><td className="p-2">{apiKeyStatus[key] || '...'}</td></tr>))}</tbody>
                      </table></div>
                    </div>
                )}
            </div>
        </div>
      </Card>

      <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={startConversion} disabled={isRunning || !fullText || apiKeys.length === 0} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl h-14 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 duration-200"><PlayCircleIcon className="w-8 h-8"/> {t('tts.controls.start')}</button>
              <button onClick={stopConversion} disabled={!isRunning} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl h-14 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 duration-200"><StopCircleIcon className="w-8 h-8"/> {t('tts.controls.stop')}</button>
          </div>
          {isRunning && (<div className="mt-4 space-y-2">
              <div className="w-full bg-accent dark:bg-dark-accent rounded-full h-4"><div className="bg-highlight h-4 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s' }}></div></div>
              <div className="text-center text-sm">{t('tts.progress.currentChunk', { current: currentProcess, total: textChunks.length })}</div>
          </div>)}
      </Card>
      
      <Card title={t('tts.results.title')} className="flex-grow flex flex-col">
          <div className="border-b border-accent dark:border-dark-accent"><nav className="-mb-px flex space-x-4">
            <button onClick={() => setActiveResultsTab('chunks')} className={getTabClass('chunks', activeResultsTab)}>{t('tts.convertedChunks.title')}</button>
            <button onClick={() => setActiveResultsTab('log')} className={getTabClass('log', activeResultsTab)}>{t('tts.logs.title')}</button>
          </nav></div>
          <div className="pt-6">
            {activeResultsTab === 'chunks' && (<div>
              <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2"> <input type="checkbox" id="selectAllForMerge" checked={isSelectAllForMergeChecked} onChange={handleSelectAllForMerge} disabled={successfulChunks.length === 0} className="h-4 w-4 rounded border-gray-300 text-highlight focus:ring-highlight disabled:opacity-50" /> <label htmlFor="selectAllForMerge" className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{t('tts.convertedChunks.selectAll')}</label> </div>
                  <button onClick={handleMergeAndDownload} disabled={selectedForMerge.size < 1 || isMerging} className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><ArchiveBoxArrowDownIcon className="w-5 h-5"/> {isMerging ? t('tts.convertedChunks.merging') : t('tts.convertedChunks.mergeAndDownload', { count: selectedForMerge.size })}</button>
              </div>
              <div className="space-y-2 overflow-y-auto max-h-[500px] p-1">
                {convertedChunks.length > 0 ? convertedChunks.map(chunk => (
                  <div key={chunk.id} className="bg-accent dark:bg-dark-accent rounded-lg p-3">
                    <button onClick={() => toggleChunkExpansion(chunk.id)} className="w-full flex items-center justify-between font-bold text-start">
                      <div className="flex items-center gap-3"> {chunk.status === 'success' && <input type="checkbox" checked={selectedForMerge.has(chunk.id)} onChange={e => { e.stopPropagation(); const newSet = new Set(selectedForMerge); e.target.checked ? newSet.add(chunk.id) : newSet.delete(chunk.id); setSelectedForMerge(newSet); }}  onClick={e => e.stopPropagation()} />} <span>{t('tts.convertedChunks.chunk', { id: chunk.id })}</span> </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${chunk.status === 'success' ? 'bg-green-200 text-green-800' : chunk.status === 'failed' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>{chunk.status}</span>
                    </button>
                    {expandedChunks.has(chunk.id) && (
                      <div className="mt-3 space-y-3">
                        <div className="relative">
                            <textarea value={chunk.editedText} onChange={e => setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? {...c, editedText: e.target.value} : c))} rows={5} className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" onSelect={(e) => handleTextSelection(e, chunk.id)} onBlur={() => handleTextareaBlur(chunk.id)} />
                            {selection && selection.chunkId === chunk.id && (<div className="absolute -top-12 right-0 z-10"><button onClick={handleOpenDictModal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 text-sm flex items-center gap-1 shadow-lg rounded-md transition-colors"><BookOpenIcon className="w-4 h-4" />{t('tts.addToDictionary.button')}</button></div>)}
                        </div>
                        {chunk.audioUrl && <audio ref={el => { audioRefs.current[chunk.id] = el; }} src={chunk.audioUrl} controls className="w-full h-10" />}
                        <div className="flex justify-end items-center gap-2"><button onClick={() => handleRetryChunk(chunk.id)} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('tts.convertedChunks.retry')}</button> {chunk.audioUrl && <a href={chunk.audioUrl} download={`${chunk.id}.mp3`} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t('tts.convertedChunks.download')}</a>}</div>
                      </div>
                    )}
                  </div>
                )) : <p className="text-center py-10 text-text-secondary">{t('tts.convertedChunks.placeholder')}</p>}
              </div>
            </div>)}
            {activeResultsTab === 'log' && (<div>
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={copyLogToClipboard} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><ClipboardDocumentIcon className="w-4 h-4"/>{t('tts.logs.copy')}</button>
                <button onClick={exportLogToFile} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><ArrowDownTrayIcon className="w-4 h-4"/>{t('tts.logs.export')}</button>
                <button onClick={clearLog} className="bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><TrashIcon className="w-4 h-4"/>{t('tts.logs.clear')}</button>
              </div>
              <div ref={logContainerRef} onScroll={handleLogScroll} className="h-[400px] bg-primary dark:bg-dark-primary p-2 rounded-md overflow-y-auto text-sm font-mono">{logMessages.map((msg, index) => <div key={index} className={`mb-1 ${msg.level === 'success' ? 'text-green-500' : msg.level === 'error' ? 'text-red-500' : ''}`}>{msg.message}</div>)}</div>
            </div>)}
          </div>
      </Card>
      
      <style>{`
        audio::-webkit-media-controls-panel { background-color: #e2e8f0; } /* light theme */
        .dark audio::-webkit-media-controls-panel { background-color: #334155; } /* dark theme */
      `}</style>
    </div>
  );
};

export default ExperimentalTextToSpeechPage;