
import React, { useState } from 'react';
import { useTextToSpeechV2 } from '../features/tts-v2/useTextToSpeechV2';
import { TTSV2Controls } from '../features/tts-v2/TTSV2Controls';
import { TTSV2Preview } from '../features/tts-v2/TTSV2Preview';
import { TTSV2History } from '../features/tts-v2/TTSV2History';
import { BeakerIcon } from '../components/icons/BeakerIcon';
import { SparklesIcon } from '../components/icons/SparklesIcon';

const TextToSpeechV2: React.FC = () => {
    const { 
        voices, history, text, setText, options, setOptions, 
        isGenerating, isLoadingVoices, error, 
        generateSpeech, deleteHistoryItem, clearHistory 
    } = useTextToSpeechV2();

    const [currentAudioBlob, setCurrentAudioBlob] = useState<Blob | null>(null);

    const handleGenerate = async () => {
        try {
            const newItem = await generateSpeech();
            if (newItem) setCurrentAudioBlob(newItem.blob);
        } catch (e) {
            // Error is handled in hook
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
                <BeakerIcon className="w-10 h-10 text-highlight dark:text-dark-highlight" />
                <div>
                    <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">Text to Speech V2</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">Advanced AI Voice Synthesis</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input & Controls */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg border border-border dark:border-dark-border shadow-sm">
                        <label className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">Input Text</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to convert to speech..."
                            className="w-full h-40 p-4 bg-accent dark:bg-dark-accent rounded-lg border-transparent focus:ring-2 focus:ring-highlight resize-none"
                            disabled={isGenerating}
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !text.trim() || isLoadingVoices}
                                className="bg-highlight text-white font-bold py-3 px-8 rounded-lg hover:bg-highlight-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-highlight/20"
                            >
                                {isGenerating ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <SparklesIcon className="w-5 h-5" />}
                                {isGenerating ? 'Generating...' : 'Generate Audio'}
                            </button>
                        </div>
                    </div>

                    <TTSV2Preview audioBlob={currentAudioBlob} />
                    
                    <TTSV2Controls 
                        voices={voices} 
                        options={options} 
                        setOptions={setOptions} 
                        disabled={isGenerating || isLoadingVoices} 
                    />
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-1">
                    <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg border border-border dark:border-dark-border shadow-sm h-full">
                        <TTSV2History 
                            items={history} 
                            onDelete={deleteHistoryItem} 
                            onClear={clearHistory}
                            onPlay={(item) => setCurrentAudioBlob(item.blob)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextToSpeechV2;
