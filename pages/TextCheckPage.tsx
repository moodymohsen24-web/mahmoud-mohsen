import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { textAnalysisService } from '../services/textAnalysisService';
import { settingsService } from '../services/settingsService';
import TextDiffViewer from '../components/TextDiffViewer';
import { useAuth } from '../hooks/useAuth';
import { ClipboardDocumentIcon } from '../components/icons/ClipboardDocumentIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';
import { ArrowUpTrayIcon } from '../components/icons/ArrowUpTrayIcon';
import type { AnalysisResponse, Settings } from '../types';
import { useNavigate } from 'react-router-dom';
import { SpeakerWaveIcon } from '../components/icons/SpeakerWaveIcon';

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


const TextCheckPage: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [originalText, setOriginalText] = useState('');
    const [analysisResults, setAnalysisResults] = useState<(AnalysisResponse | null)[]>([null, null, null]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadSettings = async () => {
            if (user) {
                const userSettings = await settingsService.getSettings(user.id);
                setSettings(userSettings);
            }
        };
        loadSettings();
    }, [user]);

    const handleReset = () => {
        setCurrentStep(0);
        setOriginalText('');
        setAnalysisResults([null, null, null]);
        setError('');
    };

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
            setOriginalText(content);
        } catch (err) {
            console.error("Failed to read file", err);
            setError(t('textCheck.error.fileRead'));
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    
    // Function to strip <ch> tags for the next processing step
    const stripHighlightTags = (text: string) => {
        return text.replace(/<ch>/g, '').replace(/<\/ch>/g, '');
    };

    const handleProcess = async () => {
        if (!user || !settings) return;
        setIsLoading(true);
        setError('');

        const selectedModel = settings.aiModels.selected;
        const apiKey = settings.aiModels.keys[selectedModel];

        if (!apiKey) {
            setError(t('textCheck.error.noApiKey'));
            setIsLoading(false);
            return;
        }

        try {
            let response;
            const sourceText = currentStep === 0 ? originalText : stripHighlightTags(analysisResults[currentStep - 1]?.processedText || '');
            
            // For now, all models use the gemini service logic. This can be expanded.
            if (currentStep === 0) {
                response = await textAnalysisService.correctAndClean(sourceText, apiKey);
            } else if (currentStep === 1) {
                response = await textAnalysisService.addSelectiveDiacritics(sourceText, apiKey);
            } else if (currentStep === 2) {
                response = await textAnalysisService.replaceWordsFromDictionary(sourceText, user.id);
            }

            if(response) {
                const newResults = [...analysisResults];
                newResults[currentStep] = response;
                setAnalysisResults(newResults);
                // Log the successful analysis
                await textAnalysisService.logAnalysis(user.id, response.correctionsCount, currentStep + 1);
            }

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(t('textCheck.error') + ` (${errorMessage})`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const nextStep = () => {
        if (currentStep < 2) setCurrentStep(currentStep + 1);
    };
    
    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };
    
    const finalProcessedText = stripHighlightTags(analysisResults[2]?.processedText || '');

    const handleCopy = () => {
        navigator.clipboard.writeText(finalProcessedText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([finalProcessedText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'corrected_text.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConvertToSpeech = () => {
        navigate('/text-to-speech', { state: { textToConvert: finalProcessedText } });
    };
    
    const titles = [t('textCheck.step1.title'), t('textCheck.step2.title'), t('textCheck.step3.title')];
    const descriptions = [t('textCheck.step1.description'), t('textCheck.step2.description'), t('textCheck.step3.description')];
    const sourceText = currentStep === 0 ? originalText : stripHighlightTags(analysisResults[currentStep - 1]?.processedText || '');
    const currentResult = analysisResults[currentStep];
    const correctionsCount = currentResult?.correctionsCount;

    const isStepCompleted = !!currentResult;

    return (
        <div className="container mx-auto max-w-5xl px-6 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('textCheck.title')}</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary">{t('textCheck.subtitle')}</p>
            </div>

            <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg">
                <Stepper currentStep={isStepCompleted ? currentStep + 1 : currentStep} />
                
                <div className="text-center my-8">
                    <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">{titles[currentStep]}</h2>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-1">{descriptions[currentStep]}</p>
                </div>

                {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4 text-center border border-red-500/20">{error}</p>}
                
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
                                    onChange={(e) => currentStep === 0 ? setOriginalText(e.target.value) : null}
                                    rows={12}
                                    className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight dark:focus:ring-dark-highlight text-text-primary dark:text-dark-text-primary"
                                    readOnly={currentStep > 0}
                                    placeholder={currentStep === 0 ? 'اكتب أو الصق النص هنا...' : ''}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 text-text-secondary dark:text-dark-text-secondary">
                                    {t('textCheck.outputText')}
                                </label>
                                <div className="w-full p-3 h-full min-h-[290px] bg-accent dark:bg-dark-accent rounded-lg text-text-primary dark:text-dark-text-primary overflow-y-auto">
                                    {isLoading ? (
                                        <div className="flex justify-center items-center h-full text-text-secondary">{t('textCheck.button.processing')}</div>
                                    ) : isStepCompleted ? (
                                        <TextDiffViewer markedText={currentResult.processedText} />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {isStepCompleted && (
                            <div className="mt-4 text-center text-sm font-medium text-green-600">
                                {typeof correctionsCount === 'number' && correctionsCount > 0 
                                    ? t('textCheck.stats', { count: correctionsCount }) 
                                    : t('textCheck.noCorrections')}
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
                         <div className="w-full p-4 bg-accent dark:bg-dark-accent rounded-lg text-text-primary dark:text-dark-text-primary text-start overflow-y-auto max-h-80 mb-6">
                            <p className="whitespace-pre-wrap">{finalProcessedText}</p>
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