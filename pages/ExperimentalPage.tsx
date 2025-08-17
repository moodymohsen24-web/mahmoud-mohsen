import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';
import { PlayCircleIcon } from '../components/icons/PlayCircleIcon';
import { StopCircleIcon } from '../components/icons/StopCircleIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { ClipboardDocumentIcon } from '../components/icons/ClipboardDocumentIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';
import { InformationCircleIcon } from '../components/icons/InformationCircleIcon';
import { AdjustmentsHorizontalIcon } from '../components/icons/AdjustmentsHorizontalIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { ArchiveBoxArrowDownIcon } from '../components/icons/ArchiveBoxArrowDownIcon';

type ConvertedChunk = {
  id: number;
  originalText: string;
  editedText: string;
  audioUrl?: string;
  blob?: Blob;
  status: 'pending' | 'converting' | 'success' | 'failed';
};

const ExperimentalPage: React.FC = () => {
  const { t } = useI18n();
  
  // States
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
  const [settings, setSettings] = useState({
    voiceId: 'N2lVS1w4EtoT3dr4eOWO', modelId: 'eleven_multilingual_v2', stability: 0.45, similarityBoost: 0.75,
    chunkMin: 450, chunkMax: 500, startFrom: 1
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'warning' | 'error'} | null>(null);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isCheckingBalances, setIsCheckingBalances] = useState(false);
  const [convertedChunks, setConvertedChunks] = useState<ConvertedChunk[]>([]);
  const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set());
  const [selectedForMerge, setSelectedForMerge] = useState<Set<number>>(new Set());
  const [isMerging, setIsMerging] = useState(false);
  const [invalidKeys, setInvalidKeys] = useState<Set<string>>(new Set());
  
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});
  
  const voices = [{ value: "nPczCjzI2devNBz1zQrb", label: "Brian" }, { value: "NFG5qt843uXKj4pFvR7C", label: "Adam Stone" }, { value: "N2lVS1w4EtoT3dr4eOWO", label: "Callum" }];
  const models = [{ value: "eleven_multilingual_v2", label: "eleven_multilingual_v2" }];
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(isRunning);
  const isUserScrolledUp = useRef(false);

  useEffect(() => {
    const node = logContainerRef.current;
    if (node) {
        const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 10;
        if (!atBottom && !isUserScrolledUp.current) {
            // It means we added a new message and we were at the bottom
        } else if (atBottom) {
             isUserScrolledUp.current = false;
        }

        if (!isUserScrolledUp.current) {
             node.scrollTop = node.scrollHeight;
        }
    }
}, [logMessages]);


  const handleLogScroll = () => {
    const node = logContainerRef.current;
    if (node) {
        const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 10;
        isUserScrolledUp.current = !atBottom;
    }
  };


  useEffect(() => { runningRef.current = isRunning; }, [isRunning]);

  const showToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadData = () => {
      try {
        const savedKeys = localStorage.getItem('elevenApiKeys');
        if (savedKeys) {
          const keys = JSON.parse(savedKeys);
          setApiKeys(keys);
          if (keys.length > 0) checkBalances(keys);
        }
        const savedSettings = localStorage.getItem('ttsSettings-exp');
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch (e) { console.error("Failed to parse data from localStorage", e); }
    };
    loadData();
  }, []);

  const saveApiKeys = (keys: string[]) => localStorage.setItem('elevenApiKeys', JSON.stringify(keys));
  const saveSettings = () => {
    localStorage.setItem('ttsSettings-exp', JSON.stringify(settings));
    log('تم حفظ الإعدادات بنجاح', 'success');
    showToast('تم حفظ الإعدادات بنجاح');
  };

  const log = (message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages(prev => [...prev, { message: `[${timestamp}] ${message}`, level }]);
  };

  const handleAddNewKey = () => {
    if (!newApiKeyInput.trim()) return showToast('الرجاء إدخال مفتاح API', 'warning');
    const keyToAdd = newApiKeyInput.trim();
    if (apiKeys.includes(keyToAdd)) return showToast('هذا المفتاح موجود بالفعل!', 'warning');
    const newKeys = [...apiKeys, keyToAdd];
    setApiKeys(newKeys);
    saveApiKeys(newKeys);
    log(`تم إضافة مفتاح: ${keyToAdd.substring(0, 4)}...`, 'success');
    checkBalanceForKey(keyToAdd);
    setNewApiKeyInput('');
  };

  const deleteSelectedKeys = () => {
    if (selectedApiKeys.length === 0) return showToast('الرجاء تحديد مفتاح واحد على الأقل للحذف', 'warning');
    const newKeys = apiKeys.filter(k => !selectedApiKeys.includes(k));
    setApiKeys(newKeys);
    saveApiKeys(newKeys);
    log(`تم حذف ${selectedApiKeys.length} مفاتيح.`, 'warning');
    setSelectedApiKeys([]);
  };

  const deleteAllKeys = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف جميع المفاتيح؟ لا يمكن التراجع عن هذا الإجراء.")) {
        setApiKeys([]); saveApiKeys([]); setSelectedApiKeys([]); setApiKeyBalance({}); setApiKeyStatus({});
        log('تم حذف جميع المفاتيح.', 'error');
    }
  };

  const handleSelectKey = (key: string, isChecked: boolean) => setSelectedApiKeys(prev => isChecked ? [...prev, key] : prev.filter(k => k !== key));
  const handleSelectAllKeys = (e: React.ChangeEvent<HTMLInputElement>) => setSelectedApiKeys(e.target.checked ? apiKeys : []);

  const checkBalanceForKey = async (apiKey: string) => {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', { headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        const balance = (data.subscription?.character_limit || 0) - (data.subscription?.character_count || 0);
        setApiKeyBalance(prev => ({ ...prev, [apiKey]: balance }));
        setApiKeyStatus(prev => ({ ...prev, [apiKey]: balance > 0 ? 'نشط' : 'غير نشط' }));
        log(`✅ مفتاح صالح ${apiKey.substring(0, 4)}...: ${balance.toLocaleString()} حرف متبقي`, 'success');
      } else {
        const errorMsg = analyzeApiError(response, apiKey);
        log(`❌ فشل فحص الرصيد: ${errorMsg}`, 'error');
        setApiKeyStatus(prev => ({ ...prev, [apiKey]: 'خطأ' }));
        if(response.status === 401) {
             setApiKeyBalance(prev => ({ ...prev, [apiKey]: 0 }));
             setApiKeyStatus(prev => ({ ...prev, [apiKey]: 'غير نشط' }));
        }
      }
    } catch (error) { log(`❌ خطأ فحص الرصيد ${apiKey.substring(0, 4)}...: ${error}`, 'error'); setApiKeyStatus(prev => ({ ...prev, [apiKey]: 'خطأ' })); }
  };
  
  const checkBalances = async (keys: string[]) => {
    if (!keys || keys.length === 0) return showToast('لا توجد مفاتيح API لفحصها', 'warning');
    setInvalidKeys(new Set());
    setIsCheckingBalances(true);
    log('جاري فحص أرصدة المفاتيح...', 'info');
    await Promise.all(keys.map(key => checkBalanceForKey(key)));
    setIsCheckingBalances(false);
  };

    const analyzeApiError = (response: Response, apiKey: string): string => {
      const keyInfo = `المفتاح: ${apiKey.substring(0, 4)}...`;
      switch (response.status) {
        case 401: return `مفتاح API غير صالح (غير مصرح به). ${keyInfo}`;
        case 429: return `تم تجاوز حد الطلبات. ${keyInfo}`;
        case 400: return `بيانات الطلب غير صالحة. ${keyInfo}`;
        default: return `خطأ API (${response.status}) - ${keyInfo}`;
      }
    };

  const loadKeysFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newKeys = (e.target?.result as string).split('\n').map(k => k.trim()).filter(Boolean);
      const addedKeys = newKeys.filter(key => !apiKeys.includes(key));
      if (addedKeys.length > 0) {
        const updatedKeys = [...apiKeys, ...addedKeys];
        setApiKeys(updatedKeys); saveApiKeys(updatedKeys);
        log(`تم تحميل ${addedKeys.length} مفاتيح جديدة`, 'success'); checkBalances(addedKeys);
      } else { showToast('لا توجد مفاتيح جديدة في الملف', 'warning'); }
    };
    reader.readAsText(file);
  };

  const splitText = (text: string): string[] => {
    const { chunkMin, chunkMax } = settings;
    if (!text) return [];
    text = text.replace(/\s+/g, ' ').trim();
    const sentences = text.split(/(?<=[.؟!])\s+/);
    const chunks: string[] = []; let chunk = "";
    for (const sentence of sentences) {
      if (chunk.length + sentence.length <= chunkMax) chunk += sentence + " ";
      else {
        if (chunk.length >= chunkMin) { chunks.push(chunk.trim()); chunk = sentence + " "; }
        else chunk += sentence + " ";
      }
    }
    if (chunk.trim()) chunks.push(chunk.trim());
    return chunks;
  };

  useEffect(() => {
    const newChunks = splitText(fullText);
    setTextChunks(newChunks);
  }, [fullText, settings.chunkMin, settings.chunkMax]);
  
  const selectTextFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFullText(content);
      log(`تم اختيار ملف النص: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  };
  
    const textToSpeech = async (text: string): Promise<{ success: boolean; audioUrl?: string; audioBlob?: Blob }> => {
      const sortedKeys = [...apiKeys].sort((a, b) => (apiKeyBalance[b] || 0) - (apiKeyBalance[a] || 0));
      const availableKeys = sortedKeys.filter(key => (apiKeyBalance[key] || 0) > 0 && !invalidKeys.has(key));

      if (availableKeys.length === 0) { 
          log(`⚠️ لا توجد مفاتيح API صالحة أو ذات رصيد متبقٍ.`, 'warning'); 
          return { success: false }; 
      }
  
      for (const key of availableKeys) {
          if (!runningRef.current) return { success: false };
          try {
              log(`🔑 تجربة المفتاح ${key.substring(0, 4)}... (رصيد: ${(apiKeyBalance[key] || 0).toLocaleString()})`, 'info');
              const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${settings.voiceId}`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json', 'xi-api-key': key, 'Accept': 'audio/mpeg' },
                  body: JSON.stringify({ text, model_id: settings.modelId, voice_settings: { stability: settings.stability, similarity_boost: settings.similarityBoost } })
              });
              
              if (response.ok) {
                  const audioBlob = await response.blob();
                  const audioUrl = URL.createObjectURL(audioBlob);
                  const newBalance = Math.max(0, (apiKeyBalance[key] || 0) - text.length);
                  setApiKeyBalance(prev => ({ ...prev, [key]: newBalance }));
                  if(newBalance <= 0) setApiKeyStatus(prev => ({ ...prev, [key]: 'غير نشط' }));
                  return { success: true, audioUrl, audioBlob };
              } else {
                  const errorMessage = analyzeApiError(response, key);
                  log(`❌ فشل API: ${errorMessage}`, 'error');
                  if (response.status === 401) {
                      setInvalidKeys(prev => new Set(prev).add(key));
                      log(`🔑 تم تمييز المفتاح ${key.substring(0, 4)}... كغير صالح لهذه الجلسة.`, 'warning');
                  }
              }
          } catch (error) { log(`❌ خطأ شبكة: ${error}`, 'error'); }
      }
      return { success: false };
  };
    
  const startConversion = async () => {
    if (!fullText || textChunks.length === 0) return showToast('الرجاء اختيار أو كتابة نص أولاً', 'warning');
    if (apiKeys.length === 0) return showToast('الرجاء إضافة مفتاح API واحد على الأقل', 'warning');

    setInvalidKeys(new Set());
    setIsRunning(true); runningRef.current = true; setProgress(0); setConvertedChunks([]); setSelectedForMerge(new Set());
    let success = 0, fail = 0;
    
    const initialChunks: ConvertedChunk[] = textChunks.map((chunkText, index) => ({
      id: index + 1, originalText: chunkText, editedText: chunkText, status: 'pending'
    }));
    setConvertedChunks(initialChunks);

    for (let i = 0; i < initialChunks.length; i++) {
        if (!runningRef.current) break;
        const chunk = initialChunks[i];
        if (chunk.id < settings.startFrom) continue;
        
        setCurrentProcess(chunk.id); setProgress(((i + 1) / textChunks.length) * 100);
        
        setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, status: 'converting' } : c));
        log(`\nجاري تحويل المقطع ${chunk.id} من ${textChunks.length}...`, 'info');

        const result = await textToSpeech(chunk.originalText);
        if (!runningRef.current) break;

        if (result.success && result.audioUrl && result.audioBlob) { 
            log(`✅ تم تحويل المقطع ${chunk.id} بنجاح`, 'success');
            setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, status: 'success', audioUrl: result.audioUrl, blob: result.audioBlob } : c));
            success++;
        }
        else {
            log(`❌ فشل في تحويل المقطع ${chunk.id}`, 'error');
            setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? { ...c, status: 'failed' } : c));
            fail++;
        }
    }
    log(`\nتم الانتهاء. نجاح: ${success} | فشل: ${fail}`, success > fail ? 'success' : 'error');
    setIsRunning(false); runningRef.current = false;
  };
  
  const handleRetryChunk = async (chunkId: number) => {
    const chunkToRetry = convertedChunks.find(c => c.id === chunkId);
    if (!chunkToRetry || !runningRef) return;
    
    runningRef.current = true; // Ensure running ref is set for this single operation
    log(`\nإعادة محاولة المقطع ${chunkId}...`, 'info');
    setConvertedChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'converting' } : c));
    const result = await textToSpeech(chunkToRetry.editedText);
    runningRef.current = isRunning; // Revert to global running state

    if (result.success && result.audioUrl && result.audioBlob) {
        log(`✅ نجحت إعادة محاولة المقطع ${chunkId}`, 'success');
        setConvertedChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'success', audioUrl: result.audioUrl, blob: result.audioBlob } : c));
    } else {
        log(`❌ فشلت إعادة محاولة المقطع ${chunkId}`, 'error');
        setConvertedChunks(prev => prev.map(c => c.id === chunkId ? { ...c, status: 'failed' } : c));
    }
  };
  
  const toggleChunkExpansion = (chunkId: number) => {
    setExpandedChunks(prevSet => {
        const newSet = new Set(prevSet);
        if (newSet.has(chunkId)) {
            newSet.delete(chunkId);
        } else {
            newSet.add(chunkId);
        }
        return newSet;
    });
  };

  const handleMergeAndDownload = async () => {
    const blobsToMerge = convertedChunks
        .filter(c => selectedForMerge.has(c.id) && c.blob)
        .sort((a, b) => a.id - b.id)
        .map(c => c.blob!);

    if (blobsToMerge.length < 1) return showToast("الرجاء تحديد مقطعين على الأقل للدمج", "warning");
    
    setIsMerging(true); log("🚀 بدء عملية دمج المقاطع...", "info");
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBuffers = await Promise.all(blobsToMerge.map(b => b.arrayBuffer().then(ab => audioContext.decodeAudioData(ab))));
        
        const totalLength = decodedBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
        const mergedBuffer = audioContext.createBuffer(1, totalLength, decodedBuffers[0].sampleRate);
        
        let offset = 0;
        for (const buffer of decodedBuffers) {
            mergedBuffer.getChannelData(0).set(buffer.getChannelData(0), offset);
            offset += buffer.length;
        }

        const wavBlob = audioBufferToWav(mergedBuffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url; a.download = 'merged_audio.wav'; a.click(); URL.revokeObjectURL(url);
        log("✅ تم دمج وتنزيل الملف بنجاح!", "success");

    } catch(e) { log(`❌ فشلت عملية الدمج: ${e}`, 'error'); }
    setIsMerging(false);
  };
  
  // Helper to convert AudioBuffer to a WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels,
          len = buffer.length * numOfChan * 2 + 44,
          abuffer = new ArrayBuffer(len),
          view = new DataView(abuffer),
          channels = [],
          sampleRate = buffer.sampleRate;
    let offset = 0, pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); setUint32(len - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(sampleRate); setUint32(sampleRate * 2 * numOfChan); setUint16(numOfChan * 2); setUint16(16);
    setUint32(0x61746164); setUint32(len - pos - 4);
    
    for (let i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));
    while (pos < len) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true); pos += 2;
        }
        offset++;
    }
    return new Blob([view], { type: 'audio/wav' });
  };
  
  const stopConversion = () => { setIsRunning(false); runningRef.current = false; log('تم إيقاف التحويل', 'warning'); };
  const copyLogToClipboard = () => navigator.clipboard.writeText(logMessages.map(msg => msg.message).join('\n')).then(() => showToast('تم نسخ السجل')).catch(err => log(`❌ فشل النسخ: ${err}`, 'error'));
  const exportLogToFile = () => {
    const blob = new Blob([logMessages.map(msg => msg.message).join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `log_${new Date().toISOString()}.txt`; a.click(); URL.revokeObjectURL(url);
    log('📁 تم تصدير السجل', 'success');
  };
  const clearLog = () => { setLogMessages([]); log('🗑️ تم مسح السجل', 'info'); };

  const totalBalance = Object.values(apiKeyBalance).reduce((sum, bal) => sum + (bal > 0 ? bal : 0), 0);

  const successfulChunks = convertedChunks.filter(c => c.status === 'success');
  const isSelectAllForMergeChecked = successfulChunks.length > 0 && selectedForMerge.size === successfulChunks.length;

  const handleSelectAllForMerge = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          const allSuccessfulIds = successfulChunks.map(c => c.id);
          setSelectedForMerge(new Set(allSuccessfulIds));
      } else {
          setSelectedForMerge(new Set());
      }
  };

  return (
    <div className="space-y-4">
      {toast && ( <div className={`fixed top-24 end-8 p-4 rounded-lg shadow-lg text-white z-50 ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}>{toast.message}</div> )}
      <h1 className="text-3xl font-bold">🎤 ورشة عمل تحويل النص إلى صوت</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <Card title="🔑 إدارة مفاتيح API">
            <div className="space-y-4 mb-4">
                <div className="flex gap-2">
                    <input type="password" value={newApiKeyInput} onChange={(e) => setNewApiKeyInput(e.target.value)} placeholder="أدخل مفتاح API الجديد هنا..." className="flex-grow form-input"/>
                    <button onClick={handleAddNewKey} className="btn-primary">إضافة</button>
                </div>
                 <div className="flex flex-wrap gap-2 border-t border-accent dark:border-dark-accent pt-4">
                    <button onClick={() => checkBalances(apiKeys)} disabled={isCheckingBalances} className="btn-secondary">{isCheckingBalances ? 'جارِ الفحص...' : 'فحص كل المفاتيح'}</button>
                    <label className="btn-secondary cursor-pointer inline-flex items-center gap-2"> <ArrowUpTrayIcon className="w-5 h-5"/> <span>تحميل ملف</span> <input type="file" accept=".txt" className="hidden" onChange={(e) => e.target.files && loadKeysFromFile(e.target.files[0])} /> </label>
                    <div className="flex-grow"></div>
                    <button onClick={deleteSelectedKeys} disabled={selectedApiKeys.length === 0} className="btn-danger-outline flex items-center gap-2"> <TrashIcon className="w-5 h-5"/> <span>{`حذف المحدد (${selectedApiKeys.length})`}</span> </button>
                    <button onClick={deleteAllKeys} disabled={apiKeys.length === 0} className="btn-danger">حذف الكل</button>
                </div>
            </div>
            <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-accent dark:bg-dark-accent sticky top-0">
                        <tr>
                            <th className="p-2"><input type="checkbox" onChange={handleSelectAllKeys} checked={apiKeys.length > 0 && selectedApiKeys.length === apiKeys.length} /></th>
                            <th className="p-2">#</th>
                            <th className="p-2">المفتاح</th>
                            <th className="p-2">الرصيد</th>
                            <th className="p-2">الحالة</th>
                        </tr>
                    </thead>
                    <tbody>{apiKeys.map((key, index) => (
                        <tr key={key} className="border-b border-accent dark:border-dark-accent">
                            <td className="p-2"><input type="checkbox" value={key} checked={selectedApiKeys.includes(key)} onChange={(e) => handleSelectKey(key, e.target.checked)} /></td>
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2 font-mono">{`${key.substring(0, 4)}...${key.substring(key.length - 4)}`}</td>
                            <td className="p-2">{apiKeyBalance[key]?.toLocaleString() ?? '...'}</td>
                            <td className="p-2">{apiKeyStatus[key] || '...'}</td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
          </Card>

          <Card title="🚀 ضوابط التحويل">
              <div className="space-y-4">
                <label className="btn-secondary cursor-pointer flex items-center justify-center gap-2 text-center w-full"> <ArrowUpTrayIcon className="w-5 h-5"/> <span>{ "رفع ملف نصي"}</span> <input type="file" accept=".txt" className="hidden" onChange={e => e.target.files && selectTextFile(e.target.files[0])} /> </label>
                <textarea
                    value={fullText} onChange={(e) => setFullText(e.target.value)}
                    rows={8} className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg"
                    placeholder="أو الصق النص الكامل هنا..."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={startConversion} disabled={isRunning || !fullText || apiKeys.length === 0} className="btn-primary w-full h-12 flex items-center justify-center gap-2"><PlayCircleIcon className="w-6 h-6"/> بدء</button>
                    <button onClick={stopConversion} disabled={!isRunning} className="btn-danger w-full h-12 flex items-center justify-center gap-2"><StopCircleIcon className="w-6 h-6"/> إيقاف</button>
                </div>
              </div>
          </Card>
          
          <Card titleIcon={<AdjustmentsHorizontalIcon className="w-6 h-6"/>} title="إعدادات التقطيع والإحصائيات">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
                <div><dt className="text-sm text-text-secondary">إجمالي الأحرف</dt><dd className="text-lg font-bold">{fullText.length.toLocaleString()}</dd></div>
                <div><dt className="text-sm text-text-secondary">عدد المقاطع</dt><dd className="text-lg font-bold">{textChunks.length.toLocaleString()}</dd></div>
                <div><dt className="text-sm text-text-secondary">إجمالي المفاتيح</dt><dd className="text-lg font-bold">{apiKeys.length}</dd></div>
                <div><dt className="text-sm text-text-secondary">إجمالي الرصيد</dt><dd className="text-lg font-bold">{totalBalance.toLocaleString()}</dd></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-accent dark:border-dark-accent pt-4">
              <Input label="أدنى حد للقطعة" type="number" value={settings.chunkMin} onChange={e => setSettings(s => ({...s, chunkMin: parseInt(e.target.value) || 450}))} />
              <Input label="أقصى حد للقطعة" type="number" value={settings.chunkMax} onChange={e => setSettings(s => ({...s, chunkMax: parseInt(e.target.value) || 500}))} />
              <Input label="ابدأ من" type="number" value={settings.startFrom} onChange={e => setSettings(s => ({...s, startFrom: parseInt(e.target.value) || 1}))} min="1"/>
            </div>
             <div className="mt-4"><button onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)} className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-accent dark:hover:bg-dark-accent"> <div className="flex items-center gap-2 font-medium"><span>إعدادات الصوت المتقدمة</span></div> <ChevronDownIcon className={`w-5 h-5 transition-transform ${isAdvancedSettingsOpen ? 'rotate-180' : ''}`} /> </button></div>
             {isAdvancedSettingsOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-accent dark:bg-dark-accent rounded-lg">
                    <Select label="الصوت" options={voices} value={settings.voiceId} onChange={e => setSettings(s => ({...s, voiceId: e.target.value}))} />
                    <Select label="النموذج" options={models} value={settings.modelId} onChange={e => setSettings(s => ({...s, modelId: e.target.value}))} />
                    <Input containerClassName="sm:col-span-2" label="الاستقرار" type="range" min="0" max="1" step="0.01" value={settings.stability} onChange={e => setSettings(s => ({...s, stability: parseFloat(e.target.value)}))} />
                    <Input containerClassName="sm:col-span-2" label="تعزيز التشابه" type="range" min="0" max="1" step="0.01" value={settings.similarityBoost} onChange={e => setSettings(s => ({...s, similarityBoost: parseFloat(e.target.value)}))} />
                    <div className="sm:col-span-2 flex justify-end"><button onClick={saveSettings} className="btn-secondary">حفظ الإعدادات</button></div>
                </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
            <Card title="📊 تقدم العملية">
                <div className="w-full bg-accent dark:bg-dark-accent rounded-full h-4"><div className="bg-highlight h-4 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s' }}></div></div>
                <div className="text-center mt-2 text-sm">المقطع الحالي: {currentProcess} / {textChunks.length}</div>
            </Card>

            <Card title="🎧 المقاطع المحولة" className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="selectAllForMerge"
                            checked={isSelectAllForMergeChecked}
                            onChange={handleSelectAllForMerge}
                            disabled={successfulChunks.length === 0}
                            className="h-4 w-4 rounded border-gray-300 text-highlight focus:ring-highlight disabled:opacity-50"
                        />
                        <label htmlFor="selectAllForMerge" className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                            تحديد الكل
                        </label>
                    </div>
                    <button onClick={handleMergeAndDownload} disabled={selectedForMerge.size < 1 || isMerging} className="btn-primary flex items-center gap-2">
                        <ArchiveBoxArrowDownIcon className="w-5 h-5"/>
                        {isMerging ? 'جارِ الدمج...' : `دمج وتنزيل (${selectedForMerge.size})`}
                    </button>
                </div>
              <div className="space-y-2 overflow-y-auto max-h-[500px] p-1">
                {convertedChunks.length > 0 ? convertedChunks.map(chunk => (
                  <div key={chunk.id} className="bg-accent dark:bg-dark-accent rounded-lg p-3">
                    <button onClick={() => toggleChunkExpansion(chunk.id)} className="w-full flex items-center justify-between font-bold text-start">
                      <div className="flex items-center gap-3">
                        {chunk.status === 'success' && <input type="checkbox" checked={selectedForMerge.has(chunk.id)} onChange={e => {
                          e.stopPropagation();
                          const newSet = new Set(selectedForMerge);
                          e.target.checked ? newSet.add(chunk.id) : newSet.delete(chunk.id);
                          setSelectedForMerge(newSet);
                        }}  onClick={e => e.stopPropagation()} />}
                        <span>المقطع #{chunk.id}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${chunk.status === 'success' ? 'bg-green-200 text-green-800' : chunk.status === 'failed' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>{chunk.status}</span>
                    </button>
                    {expandedChunks.has(chunk.id) && (
                      <div className="mt-3 space-y-3">
                        <textarea value={chunk.editedText} onChange={e => setConvertedChunks(prev => prev.map(c => c.id === chunk.id ? {...c, editedText: e.target.value} : c))} rows={5} className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
                        {chunk.audioUrl && <audio ref={el => { audioRefs.current[chunk.id] = el; }} src={chunk.audioUrl} controls className="w-full h-10" />}
                        <div className="flex justify-end gap-2">
                           <button onClick={() => handleRetryChunk(chunk.id)} className="btn-secondary text-sm">إعادة المحاولة</button>
                           {chunk.audioUrl && <a href={chunk.audioUrl} download={`${chunk.id}.mp3`} className="btn-secondary text-sm">تحميل</a>}
                        </div>
                      </div>
                    )}
                  </div>
                )) : <p className="text-center py-10 text-text-secondary">ستظهر المقاطع هنا بعد التحويل.</p>}
              </div>
            </Card>
            
            <Card title="📝 سجل العمليات" className="flex flex-col h-[400px]">
                 <div className="flex flex-wrap gap-2 mb-4">
                    <button onClick={copyLogToClipboard} className="btn-secondary flex items-center gap-1"><ClipboardDocumentIcon className="w-4 h-4"/> نسخ</button>
                    <button onClick={exportLogToFile} className="btn-secondary flex items-center gap-1"><ArrowDownTrayIcon className="w-4 h-4"/> تصدير</button>
                    <button onClick={clearLog} className="btn-secondary flex items-center gap-1"><TrashIcon className="w-4 h-4"/> مسح</button>
                </div>
                <div ref={logContainerRef} onScroll={handleLogScroll} className="flex-grow bg-primary dark:bg-dark-primary p-2 rounded-md overflow-y-auto text-sm font-mono">
                    {logMessages.map((msg, index) => <div key={index} className={`mb-1 ${msg.level === 'success' ? 'text-green-500' : msg.level === 'error' ? 'text-red-500' : ''}`}>{msg.message}</div>)}
                </div>
            </Card>
        </div>
      </div>
      <style>{`
        .btn-primary { @apply bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
        .btn-secondary { @apply bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary font-medium py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
        .btn-danger { @apply bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
        .btn-danger-outline { @apply bg-transparent text-red-600 border border-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-red-600/50 disabled:border-red-600/50; }
        .form-input { @apply px-3 py-2 text-text-primary dark:text-dark-text-primary bg-secondary dark:bg-dark-secondary rounded-lg border border-accent dark:border-dark-accent focus:outline-none focus:ring-2 focus:ring-highlight dark:focus:ring-dark-highlight; }
        audio::-webkit-media-controls-panel { background-color: #e2e8f0; } /* light theme */
        .dark audio::-webkit-media-controls-panel { background-color: #334155; } /* dark theme */
      `}</style>
    </div>
  );
};

export default ExperimentalPage;