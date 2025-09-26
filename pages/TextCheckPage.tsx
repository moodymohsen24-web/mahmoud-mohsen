import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n';
import { textAnalysisService } from '../services/textAnalysisService';
import { settingsService } from '../services/settingsService';
import TextDiffViewer from '../components/TextDiffViewer';
import { useAuth } from '../hooks/useAuth';
import { ClipboardDocumentIcon } from '../components/icons/ClipboardDocumentIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';
import type { AnalysisResponse, Settings, Project } from '../types';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SpeakerWaveIcon } from '../components/icons/SpeakerWaveIcon';
import ProgressLoader from '../components/ProgressLoader';
import { projectService } from '../services/projectService';
import { SaveIcon } from '../components/icons/SaveIcon';

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const { t } = useI18n();
    const steps = [
        t('textCheck.step1.title'),
        t('textCheck.step2.title'),
        t('textCheck.step3.title'),
    ];

    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${
                                currentStep > index
                                    ? 'bg-green-500 text-white'
                                    : currentStep === index
                                    ? 'bg-highlight text-white'
                                    : 'bg-accent dark:bg-dark-accent text-text-secondary dark:text-dark-text-secondary'
                            }`}
                        >
                            {currentStep > index ? '✓' : index + 1}
                        </div>
                        <span className={`ms-4 font-medium ${currentStep >= index ? 'text-text-primary dark:text-dark-text-primary' : 'text-text-secondary dark:text-dark-text-secondary'}`}>{step}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-auto border-t-2 transition-colors duration-300 mx-4 ${currentStep > index ? 'border-green-500' : 'border-accent dark:border-dark-accent'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// A small component for stats display
const TextStatsDisplay: React.FC<{ text: string }> = ({ text }) => {
    const { t } = useI18n();
    const characters = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

    return (
        <div className="text-end text-sm text-text-secondary dark:text-dark-text-secondary mt-2 px-2">
            <span>{t('textCheck.stats.words')}: {words.toLocaleString()}</span>
            <span className="mx-2">|</span>
            <span>{t('textCheck.stats.characters')}: {characters.toLocaleString()}</span>
        </div>
    );
};

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Promise timed out after ${ms} ms`));
        }, ms);

        promise.then(
            (res) => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            (err) => {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    });
};


const TextCheckPage: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const { projectId } = useParams<{ projectId?: string }>();
    const navigate = useNavigate();
    
    const [settings, setSettings] = useState<Settings | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    
    const [currentStep, setCurrentStep] = useState(0);
    const [originalText, setOriginalText] = useState('');
    const [analysisResults, setAnalysisResults] = useState<(AnalysisResponse | null)[]>([null, null, null]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    
    const SESSION_STORAGE_KEY = `text-check-session-${user?.id}`;

    const handleReset = useCallback(() => {
        setCurrentStep(0);
        setOriginalText('');
        setAnalysisResults([null, null, null]);
        setError('');
        setProject(null);
        if (user) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
        }
        navigate('/text-check', { replace: true });
    }, [user, navigate, SESSION_STORAGE_KEY]);

    // Load session or project
    useEffect(() => {
        const loadData = async () => {
            if (!user) return;
            setIsPageLoading(true);

            if (projectId) {
                // Loading a specific project
                localStorage.removeItem(SESSION_STORAGE_KEY); // Clear any stray session
                try {
                    const loadedProject = await projectService.getProjectById(projectId);
                    if (loadedProject && loadedProject.user_id === user.id) {
                        setProject(loadedProject);
                        setOriginalText(loadedProject.original_text);
                        setAnalysisResults(loadedProject.analysis_results || [null, null, null]);
                        setCurrentStep(loadedProject.current_step || 0);
                        setSaveStatus('saved');
                    } else {
                        navigate('/text-check');
                    }
                } catch (e) {
                    console.error("Failed to load project", e);
                    navigate('/projects');
                }
            } else {
                // No project ID, attempt to load from session storage
                const savedSessionRaw = localStorage.getItem(SESSION_STORAGE_KEY);
                if (savedSessionRaw) {
                    try {
                        const savedSession = JSON.parse(savedSessionRaw);
                        setOriginalText(savedSession.originalText || '');
                        setAnalysisResults(savedSession.analysisResults || [null, null, null]);
                        setCurrentStep(savedSession.currentStep || 0);
                        setSaveStatus('idle'); // Session is always "unsaved"
                    } catch (e) {
                        console.error("Failed to parse saved session", e);
                        localStorage.removeItem(SESSION_STORAGE_KEY);
                    }
                } else {
                    // No project and no session, start fresh
                    handleReset();
                }
            }
            setIsPageLoading(false);
        };
        loadData();
    }, [projectId, user, navigate, handleReset, SESSION_STORAGE_KEY]);
    
    // Save session to local storage
    useEffect(() => {
        // Only save if there's no active project ID and there is text.
        if (!projectId && originalText && user) {
            const sessionToSave = JSON.stringify({
                originalText,
                analysisResults,
                currentStep,
            });
            localStorage.setItem(SESSION_STORAGE_KEY, sessionToSave);
            setSaveStatus('idle');
        }
    }, [originalText, analysisResults, currentStep, projectId, user, SESSION_STORAGE_KEY]);


    useEffect(() => {
        const loadSettings = async () => {
            if (user) {
                const userSettings = await settingsService.getSettings(user.id);
                setSettings(userSettings);
            }
        };
        loadSettings();
    }, [user]);

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        if (file.type !== 'text/plain') {
            setError(t('textCheck.error.fileType'));
            return;
        }
        setError('');

        try {
            const content = await file.text();
            handleReset();
            // Need a slight delay for state to reset before setting new text
            setTimeout(() => setOriginalText(content), 0);
        } catch (err) {
            console.error("Failed to read file", err);
            setError(t('textCheck.error.fileRead'));
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    
    const stripHighlightTags = (text: string) => {
        return text.replace(/<ch.*?>/g, '').replace(/<\/ch>/g, '');
    };

    const handleSave = async (updatedResults: (AnalysisResponse | null)[], updatedStep: number) => {
        if (!user) return;
        setSaveStatus('saving');
    
        if (project) { // Update existing project
            try {
                const updatedProject = await projectService.updateProject(project.id, {
                    analysis_results: updatedResults,
                    current_step: updatedStep,
                    original_text: originalText,
                });
                setProject(updatedProject);
                setSaveStatus('saved');
            } catch (err) {
                setSaveStatus('error');
            }
        } else { // Create new project
            if (!newProjectName.trim()) {
                setIsSaveModalOpen(true);
                // Saving will be triggered by modal submission
                setSaveStatus('idle'); // Reset status while modal is open
                return;
            }
        }
    };
    
    const handleCreateProject = async () => {
        if (!user || !newProjectName.trim()) return;
        setIsSaveModalOpen(false);
        setSaveStatus('saving');
        try {
            const newProject = await projectService.createProject(user.id, newProjectName, originalText, analysisResults, currentStep);
            setSaveStatus('saved');
            setNewProjectName('');
            localStorage.removeItem(SESSION_STORAGE_KEY);
            navigate(`/text-check/${newProject.id}`, { replace: true });
        } catch(e) {
            setSaveStatus('error');
        }
    };
    
    const handleProcess = async () => {
        if (!user || !settings) return;
        
        const selectedModel = settings.aiModels.selected;
        const apiKey = settings.aiModels.keys[selectedModel];
        if (!apiKey) {
            setError(t('textCheck.error.noApiKey'));
            return;
        }
    
        setIsLoading(true);
        setError('');
        setProgress(null);
    
        try {
            const sourceText = currentStep === 0 ? originalText : stripHighlightTags(analysisResults[currentStep - 1]?.processedText || '');
            
            const chunks = sourceText.split('\n\n').filter(chunk => chunk.trim().length > 0);
            const totalChunks = chunks.length;
            if (totalChunks === 0) {
                setIsLoading(false);
                return;
            }
    
            setProgress({ current: 0, total: totalChunks });
    
            const processChunk = (chunk: string): Promise<AnalysisResponse> => {
                switch (currentStep) {
                    case 0:
                        return textAnalysisService.correctAndClean(chunk, apiKey);
                    case 1:
                        return textAnalysisService.addSelectiveDiacritics(chunk, apiKey);
                    case 2:
                        return textAnalysisService.replaceWordsFromDictionary(chunk, user.id);
                    default:
                        return Promise.resolve({ processedText: chunk, correctionsCount: 0 });
                }
            };
            
            const CONCURRENCY_LIMIT = 5;
            let allResults: AnalysisResponse[] = [];
            let processedChunksCount = 0;
    
            for (let i = 0; i < totalChunks; i += CONCURRENCY_LIMIT) {
                const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
                const batchPromises = batch.map(chunk => withTimeout(processChunk(chunk), 30000));
    
                const batchSettledResults = await Promise.allSettled(batchPromises);

                const currentBatchResults: AnalysisResponse[] = batchSettledResults.map((result, index) => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    } else {
                        console.error(`Chunk processing failed or timed out for chunk "${batch[index].substring(0, 50)}...":`, result.reason);
                        return { processedText: batch[index], correctionsCount: 0 };
                    }
                });
                
                allResults = [...allResults, ...currentBatchResults];
                processedChunksCount += batch.length;
                setProgress({ current: processedChunksCount, total: totalChunks });
                
                const combinedResult = allResults.reduce(
                    (acc, response, index) => {
                        acc.processedText += (index > 0 ? '\n\n' : '') + response.processedText;
                        acc.correctionsCount += response.correctionsCount;
                        return acc;
                    }, { processedText: '', correctionsCount: 0 }
                );
    
                const newResults = [...analysisResults];
                newResults[currentStep] = combinedResult;
                setAnalysisResults(newResults);
            }
            
            const finalCombinedResult = allResults.reduce((acc, res) => ({...acc, correctionsCount: acc.correctionsCount + res.correctionsCount}), {processedText: '', correctionsCount: 0});
            await textAnalysisService.logAnalysis(user.id, finalCombinedResult.correctionsCount, currentStep + 1);
    
            const finalResultsState = [...analysisResults];
            finalResultsState[currentStep] = allResults.reduce((acc, res, idx) => ({
                processedText: acc.processedText + (idx > 0 ? '\n\n' : '') + res.processedText,
                correctionsCount: acc.correctionsCount + res.correctionsCount,
            }), { processedText: '', correctionsCount: 0 });

            if (project) {
                await handleSave(finalResultsState, currentStep);
            } else {
                setSaveStatus('idle');
            }
    
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(t('textCheck.error') + ` (${errorMessage})`);
        } finally {
            setIsLoading(false);
            setProgress(null);
        }
    };
    
    const nextStep = () => { if (currentStep < 2) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
    const finalProcessedText = analysisResults[2] ? stripHighlightTags(analysisResults[2]?.processedText || '') : '';
    const handleCopy = () => { navigator.clipboard.writeText(finalProcessedText); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); };

    const handleDownload = () => {
        const blob = new Blob([finalProcessedText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${project?.name || 'corrected_text'}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConvertToSpeech = () => { navigate('/text-to-speech', { state: { textToConvert: finalProcessedText } }); };
    
    const titles = [t('textCheck.step1.title'), t('textCheck.step2.title'), t('textCheck.step3.title')];
    const descriptions = [t('textCheck.step1.description'), t('textCheck.step2.description'), t('textCheck.step3.description')];
    const sourceText = currentStep === 0 ? originalText : stripHighlightTags(analysisResults[currentStep - 1]?.processedText || '');
    const currentResult = analysisResults[currentStep];
    const correctionsCount = currentResult?.correctionsCount;
    const isStepCompleted = !!currentResult;
    
    const getSaveStatusText = () => {
        switch(saveStatus) {
            case 'saving': return t('textCheck.save.status.saving');
            case 'saved': return t('textCheck.save.status.saved');
            case 'error': return t('textCheck.save.status.error');
            case 'idle': return project || originalText ? t('textCheck.save.status.unsaved') : '';
            default: return '';
        }
    }

    if (isPageLoading) {
        return <ProgressLoader />;
    }

    return (
        <div className="container mx-auto max-w-5xl px-6 py-8">
            {isSaveModalOpen && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsSaveModalOpen(false)}>
                    <div className="bg-secondary dark:bg-dark-secondary rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">{t('textCheck.save.modalTitle')}</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }}>
                            <label className="block text-sm font-bold mb-2" htmlFor="projectName">{t('textCheck.save.modalLabel')}</label>
                            <input
                                id="projectName" type="text" value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)} required autoFocus
                                placeholder={t('textCheck.save.modalPlaceholder')}
                                className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                            />
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={() => setIsSaveModalOpen(false)} className="py-2 px-4 rounded-md hover:bg-gray-500/10">{t('planManagement.cancel')}</button>
                                <button type="submit" className="py-2 px-4 rounded-md bg-highlight text-white hover:bg-blue-700">{t('textCheck.save.modalButton')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-1">{project?.name || t('textCheck.title')}</h1>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                            <Link to="/projects" className="hover:underline">{t('sidebar.projects')}</Link>
                            {project && <span> / {project.name}</span>}
                        </p>
                    </div>
                     <div className="flex items-center gap-4">
                        <span className="text-sm text-text-secondary dark:text-dark-text-secondary italic">{getSaveStatusText()}</span>
                        <button
                            onClick={() => handleSave(analysisResults, currentStep)}
                            disabled={saveStatus === 'saving' || !originalText}
                            className="flex items-center gap-2 bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                           <SaveIcon className="w-5 h-5" />
                           {t('textCheck.save.button')}
                        </button>
                    </div>
                </div>

                <Stepper currentStep={isStepCompleted ? currentStep + 1 : currentStep} />
                <div className="text-center my-8">
                    <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">{titles[currentStep]}</h2>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-1">{descriptions[currentStep]}</p>
                </div>

                {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-center border border-red-500/20">{error}</p>}
                
                {isLoading && progress && (
                    <div className="my-8 p-6 bg-accent/50 dark:bg-dark-accent/50 rounded-lg border border-border dark:border-dark-border">
                        <h3 className="text-center text-xl font-bold mb-3 text-text-primary dark:text-dark-text-primary">
                            {t('textCheck.button.processing')}
                        </h3>
                        <p className="text-center text-lg mb-4 text-text-secondary dark:text-dark-text-secondary tabular-nums">
                            {t('textCheck.processingChunk', { current: progress.current, total: progress.total })}
                        </p>
                        <div className="w-full bg-secondary dark:bg-dark-secondary rounded-full h-4 border border-border dark:border-dark-border overflow-hidden">
                            <div 
                                className="bg-highlight h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-center" 
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            >
                               <span className="text-white text-xs font-bold px-2">{Math.round((progress.current / progress.total) * 100)}%</span>
                            </div>
                        </div>
                    </div>
                )}


                {currentStep < 3 && !analysisResults[2] && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary">
                                        {t('textCheck.inputText')}
                                    </label>
                                    {currentStep === 0 && (
                                        <>
                                            <input type="file" accept=".txt" onChange={handleFileImport} ref={fileInputRef} className="hidden" id="text-file-upload" />
                                            <label htmlFor="text-file-upload" className="flex items-center gap-2 cursor-pointer bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                                <ArrowUpTrayIcon className="w-5 h-5" />
                                                <span>{t('textCheck.button.upload')}</span>
                                            </label>
                                        </>
                                    )}
                                </div>
                                <textarea
                                    value={sourceText}
                                    onChange={(e) => {
                                        if (currentStep === 0) {
                                            setOriginalText(e.target.value);
                                            setSaveStatus('idle'); // Mark as unsaved changes
                                        }
                                    }}
                                    rows={12}
                                    className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight dark:focus:ring-dark-highlight text-text-primary dark:text-dark-text-primary"
                                    readOnly={currentStep > 0}
                                    placeholder={currentStep === 0 ? 'اكتب أو الصق النص هنا...' : ''}
                                />
                                <TextStatsDisplay text={sourceText} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-text-secondary dark:text-dark-text-secondary">
                                    {t('textCheck.outputText')}
                                </label>
                                <div className="w-full min-h-[290px] bg-accent dark:bg-dark-accent rounded-lg text-text-primary dark:text-dark-text-primary overflow-y-auto">
                                    {isStepCompleted ? (
                                        <TextDiffViewer markedText={currentResult.processedText} />
                                    ) : null}
                                </div>
                                {isStepCompleted && <TextStatsDisplay text={stripHighlightTags(currentResult.processedText)} />}
                            </div>
                        </div>

                        {isStepCompleted && !isLoading && (
                            <div className={`mt-4 text-center text-sm font-medium ${correctionsCount && correctionsCount > 0 ? 'text-green-600' : 'text-text-secondary dark:text-dark-text-secondary'}`}>
                                {typeof correctionsCount === 'number' && correctionsCount > 0 
                                    ? t('textCheck.stats', { count: correctionsCount }) 
                                    : (currentStep === 2 ? t('textCheck.step3.noMatches') : t('textCheck.noCorrections'))}
                            </div>
                        )}

                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex gap-4">
                               <button onClick={prevStep} disabled={currentStep === 0 || isLoading} className="py-2 px-4 rounded-md text-text-primary dark:text-dark-text-primary hover:bg-accent dark:hover:bg-dark-accent transition-colors disabled:opacity-50">
                                {t('textCheck.button.previousStep')}
                               </button>
                               <button
                                 onClick={handleProcess}
                                 disabled={isLoading || !sourceText || !settings}
                                 className="bg-highlight text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                               >
                                 {isLoading ? t('textCheck.button.processing') : t('textCheck.button.process')}
                               </button>
                            </div>

                            {isStepCompleted && currentStep < 2 && (
                                <button onClick={nextStep} disabled={isLoading} className="bg-green-500 text-white font-bold py-2 px-6 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">
                                    {t('textCheck.button.nextStep')}
                                </button>
                            )}
                             {isStepCompleted && currentStep === 2 && (
                                <button onClick={handleReset} className="py-2 px-4 rounded-md text-highlight border border-highlight hover:bg-highlight/10 transition-colors">
                                    {t('textCheck.button.startOver')}
                                </button>
                            )}
                        </div>
                    </>
                )}

                {analysisResults[2] && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">{t('textCheck.finalResult')}</h3>
                         <div className="w-full p-4 bg-accent dark:bg-dark-accent rounded-lg text-text-primary dark:text-dark-text-primary text-start overflow-y-auto max-h-80">
                            <p className="whitespace-pre-wrap">{finalProcessedText}</p>
                        </div>
                        <div className="my-4">
                            <TextStatsDisplay text={finalProcessedText} />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={handleCopy} className="flex items-center gap-2 py-2 px-4 rounded-md text-text-primary dark:text-dark-text-primary bg-accent dark:bg-dark-accent hover:bg-gray-200 dark:hover:bg-dark-accent/80 transition-colors">
                                <ClipboardDocumentIcon className="w-5 h-5" />
                                {copySuccess ? t('textCheck.copySuccess') : t('textCheck.button.copy')}
                            </button>
                            <button onClick={handleDownload} className="flex items-center gap-2 py-2 px-4 rounded-md text-text-primary dark:text-dark-text-primary bg-accent dark:bg-dark-accent hover:bg-gray-200 dark:hover:bg-dark-accent/80 transition-colors">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                                {t('textCheck.button.download')}
                            </button>
                            <button onClick={handleConvertToSpeech} className="flex items-center gap-2 py-2 px-4 rounded-md text-text-primary dark:text-dark-text-primary bg-accent dark:bg-dark-accent hover:bg-gray-200 dark:hover:bg-dark-accent/80 transition-colors">
                                <SpeakerWaveIcon className="w-5 h-5" />
                                {t('textCheck.button.tts')}
                            </button>
                            <button onClick={handleReset} className="py-2 px-4 rounded-md text-highlight border border-highlight hover:bg-highlight/10 transition-colors">
                                {t('textCheck.button.startOver')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextCheckPage;