import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { v4 as uuidv4 } from 'uuid';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/settingsService';
import type { Settings } from '../types';
import { Card } from '../components/ui/Card';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { PinIcon } from '../components/icons/PinIcon';
import GeneratingAnimation from '../components/GeneratingAnimation';

type ImageInput = {
    base64: string;
    mimeType: string;
    previewUrl: string;
};

type HistoryImage = {
    id: string;
    url: string; // data URL
};

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string; previewUrl: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve({
            base64: result.split(',')[1],
            mimeType: file.type,
            previewUrl: result
        });
    };
    reader.onerror = (error) => reject(error);
  });


const ImageGeneratorPage: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set());
    
    const [imageInput, setImageInput] = useState<ImageInput | null>(null);
    const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState('');

    const [imageHistory, setImageHistory] = useState<HistoryImage[]>([]);
    const [pinnedImage, setPinnedImage] = useState<HistoryImage | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState<Settings | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const [generationProgress, setGenerationProgress] = useState(0);
    const progressIntervalRef = useRef<number | null>(null);

    const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash-image' | 'imagen-4.0-generate-001'>('gemini-2.5-flash-image');
    const [numberOfImages, setNumberOfImages] = useState(1);
    
    const HISTORY_LIMIT = 20; // Keep the last 20 images to prevent storage issues
    const HISTORY_STORAGE_KEY = `image-generator-history-${user?.id}`;
    const PINNED_STORAGE_KEY = `image-generator-pinned-${user?.id}`;

    useEffect(() => {
        if (user) {
            try {
                const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
                if (savedHistory) setImageHistory(JSON.parse(savedHistory));
                const savedPinned = localStorage.getItem(PINNED_STORAGE_KEY);
                if (savedPinned) setPinnedImage(JSON.parse(savedPinned));
            } catch (e) {
                console.error("Could not save image history. Storage might be full.", e);
                localStorage.removeItem(HISTORY_STORAGE_KEY);
                localStorage.removeItem(PINNED_STORAGE_KEY);
            }
        }
    }, [user, HISTORY_STORAGE_KEY, PINNED_STORAGE_KEY]);

    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(imageHistory));
            } catch (e) {
                console.error("Could not save image history. Storage might be full.", e);
                setError("Could not save image history. Storage might be full.");
            }
        }
    }, [imageHistory, user, HISTORY_STORAGE_KEY]);

    useEffect(() => {
        if (user) {
            try {
                if (pinnedImage) {
                    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedImage));
                } else {
                    localStorage.removeItem(PINNED_STORAGE_KEY);
                }
            } catch (e) {
                console.error("Could not save pinned image. Storage might be full.", e);
            }
        }
    }, [pinnedImage, user, PINNED_STORAGE_KEY]);

    useEffect(() => {
        // When switching to a model that doesn't support image inputs, clear them.
        if (selectedModel === 'imagen-4.0-generate-001') {
            if (imageInput) setImageInput(null);
            if (pinnedImage) setPinnedImage(null);
        }
    }, [selectedModel, imageInput, pinnedImage]);

    useEffect(() => {
        const loadSettings = async () => {
            if (user) {
                const userSettings = await settingsService.getSettings(user.id);
                setSettings(userSettings);
            }
        };
        loadSettings();
    }, [user]);

    const stylePresets = [
        { id: 'cinematic', labelKey: 'imageGenerator.styles.cinematic' },
        { id: 'photographic', labelKey: 'imageGenerator.styles.photographic' },
        { id: 'anime', labelKey: 'imageGenerator.styles.anime' },
        { id: 'fantasy art', labelKey: 'imageGenerator.styles.fantasy' },
        { id: 'cartoon', labelKey: 'imageGenerator.styles.cartoon' },
        { id: '3d model', labelKey: 'imageGenerator.styles.3d' },
    ];

    const toggleStyle = (style: string) => {
        setActiveStyles(prev => {
            const newStyles = new Set(prev);
            if (newStyles.has(style)) newStyles.delete(style);
            else newStyles.add(style);
            return newStyles;
        });
    };

    const handleFileChange = async (files: FileList | null) => {
        if (files && files[0]) {
            try {
                const { base64, mimeType, previewUrl } = await fileToBase64(files[0]);
                setImageInput({ base64, mimeType, previewUrl });
            } catch (err) {
                setError('Failed to read image file.');
            }
        }
    };
    
    const handleUrlLoad = async () => {
        if (!imageUrl.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            // Using a CORS proxy for client-side fetching
            const response = await fetch(`https://cors-anywhere.herokuapp.com/${imageUrl}`);
            if (!response.ok) throw new Error(`Failed to fetch image. Status: ${response.status}`);
            const blob = await response.blob();
            const { base64, mimeType, previewUrl } = await fileToBase64(new File([blob], "url-image", {type: blob.type}));
            setImageInput({ base64, mimeType, previewUrl });
        } catch (err) {
            console.error(err);
            setError('Failed to load image from URL. The URL might be invalid or protected by CORS policy.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const removeImage = () => {
        setImageInput(null);
        setImageUrl('');
    };
    
    const handlePin = (image: HistoryImage) => {
        setPinnedImage(prev => prev?.id === image.id ? null : image);
    };
    
    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear the entire image history? This cannot be undone.')) {
            setImageHistory([]);
            setPinnedImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() && !imageInput && !pinnedImage) return;

        const apiKey = settings?.aiModels.keys.gemini;
        if (!apiKey) {
            setError(t('imageGenerator.error.noApiKey'));
            return;
        }

        setIsLoading(true);
        setError('');
        setGenerationProgress(0);

        progressIntervalRef.current = window.setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 99) {
                    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
                    return 99;
                }
                const increment = Math.max(1, Math.floor((100 - prev) / 15));
                return Math.min(prev + increment, 99);
            });
        }, 300);

        try {
            const ai = new GoogleGenAI({ apiKey });
            
            const stylePrompt = Array.from(activeStyles).join(', ');
            let basePrompt = [prompt.trim(), stylePrompt].filter(Boolean).join(', ');
            const fullPrompt = negativePrompt.trim()
                ? `${basePrompt}. Negative prompt: ${negativePrompt.trim()}`
                : basePrompt;

            const newImages: HistoryImage[] = [];

            if (selectedModel === 'imagen-4.0-generate-001') {
                 const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: fullPrompt,
                    config: {
                        numberOfImages: numberOfImages,
                    },
                });

                if (!response.generatedImages || response.generatedImages.length === 0) {
                    throw new Error("The model did not return an image. Please try adjusting your prompt.");
                }

                for (const generatedImage of response.generatedImages) {
                    const base64ImageBytes: string = generatedImage.image.imageBytes;
                    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                    newImages.push({ id: uuidv4(), url: imageUrl });
                }
            } else { // gemini-2.5-flash-image
                if (pinnedImage && !prompt.trim()) {
                    basePrompt = "Redraw this character with slight variations, maintaining the same style.";
                }

                const parts = [];
                if (pinnedImage) {
                    const urlParts = pinnedImage.url.split(',');
                    const dataPart = urlParts[1];
                    const mimeType = urlParts[0].match(/:(.*?);/)?.[1] || 'image/png';
                    // Robust check for valid data URL
                    if (dataPart && mimeType.startsWith('image/')) {
                         parts.push({ inlineData: { mimeType, data: dataPart } });
                    } else {
                        console.error("Pinned image data URL is invalid.", pinnedImage.url.substring(0, 100));
                        throw new Error("The pinned image is corrupted and cannot be used. Please unpin it.");
                    }
                }
                if (imageInput) {
                    parts.push({ inlineData: { mimeType: imageInput.mimeType, data: imageInput.base64 } });
                }
                if(fullPrompt.trim()) {
                     parts.push({ text: fullPrompt });
                }
                if (parts.length === 0) {
                    throw new Error("Please provide a prompt or an image.");
                }

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts },
                    config: { responseModalities: [Modality.IMAGE] },
                });
                
                for (const part of response.candidates?.[0]?.content?.parts || []) {
                    if (part.inlineData) {
                        const base64ImageBytes: string = part.inlineData.data;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        newImages.push({ id: uuidv4(), url: imageUrl });
                    }
                }
            }

            if (newImages.length === 0) {
                throw new Error("The model did not return an image. Please try adjusting your prompt.");
            }
            setImageHistory(prev => [...newImages, ...prev].slice(0, HISTORY_LIMIT));

        } catch (err) {
            console.error("Image generation failed:", err);
            const message = err instanceof Error ? err.message : t('imageGenerator.error.generic');
            setError(message);
        } finally {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            setGenerationProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setGenerationProgress(0);
            }, 500);
        }
    };
    
    const openModal = (imageUrl: string) => { setSelectedImage(imageUrl); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setSelectedImage(null); };

    const promptPlaceholder = pinnedImage
        ? t('imageGenerator.pinned.promptPlaceholder')
        : imageInput
        ? t('imageGenerator.imageInput.promptPlaceholderWithImage')
        : t('imageGenerator.promptPlaceholder');

    return (
        <div className="container mx-auto space-y-8">
             <style>{`
                details > summary { list-style: none; }
                details > summary::-webkit-details-marker { display: none; }
                details[open] > summary svg { transform: rotate(180deg); }
            `}</style>
            {isModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeModal}>
                    <div className="relative" onClick={e => e.stopPropagation()}>
                        <img src={selectedImage} alt="Generated image preview" className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl" />
                        <button onClick={closeModal} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-1 hover:scale-110 transition-transform">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
            <div className="animate-fade-in-down">
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('imageGenerator.title')}</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary">{t('imageGenerator.subtitle')}</p>
            </div>
            
            <div className="animate-fade-in-up">
                <Card>
                    <div className="space-y-6">
                        {/* Model Selection */}
                        <div>
                             <label htmlFor="aiModelSelect" className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">{t('imageGenerator.model.title')}</label>
                             <select
                                id="aiModelSelect"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value as any)}
                                className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"
                            >
                                <option value="gemini-2.5-flash-image">{t('imageGenerator.model.gemini-flash-image')}</option>
                                <option value="imagen-4.0-generate-001">{t('imageGenerator.model.imagen-4')}</option>
                            </select>
                            {selectedModel === 'imagen-4.0-generate-001' && (
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">{t('imageGenerator.model.note')}</p>
                            )}
                        </div>

                        {selectedModel === 'gemini-2.5-flash-image' && (
                            <>
                                {/* Pinned Image Section */}
                                {pinnedImage && (
                                    <div>
                                        <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-3">{t('imageGenerator.pinned.title')}</h3>
                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden group">
                                            <img src={pinnedImage.url} alt="Pinned image preview" className="w-full h-full object-cover" />
                                            <button onClick={() => setPinnedImage(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity" title={t('imageGenerator.pinned.unpin')}>
                                                <XMarkIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Image Input Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-3">{t('imageGenerator.imageInput.title')}</h3>
                                    {imageInput ? (
                                        <div className="relative w-48 h-48 rounded-lg overflow-hidden group">
                                            <img src={imageInput.previewUrl} alt="Input preview" className="w-full h-full object-cover" />
                                            <button onClick={removeImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <XMarkIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-accent dark:bg-dark-accent rounded-lg">
                                            <div className="flex border-b border-border dark:border-dark-border mb-4">
                                                <button onClick={() => setImageInputMode('upload')} className={`px-4 py-2 text-sm font-semibold rounded-t-md ${imageInputMode === 'upload' ? 'bg-secondary dark:bg-dark-secondary' : 'text-text-secondary'}`}>{t('imageGenerator.imageInput.uploadTab')}</button>
                                                <button onClick={() => setImageInputMode('url')} className={`px-4 py-2 text-sm font-semibold rounded-t-md ${imageInputMode === 'url' ? 'bg-secondary dark:bg-dark-secondary' : 'text-text-secondary'}`}>{t('imageGenerator.imageInput.urlTab')}</button>
                                            </div>
                                            {imageInputMode === 'upload' ? (
                                                <label className="relative block w-full border-2 border-dashed border-border dark:border-dark-border rounded-lg p-12 text-center cursor-pointer hover:border-highlight dark:hover:border-dark-highlight">
                                                    <PhotoIcon className="mx-auto h-12 w-12 text-text-secondary dark:text-dark-text-secondary opacity-50"/>
                                                    <span className="mt-2 block text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">{t('imageGenerator.imageInput.uploadCta')}</span>
                                                    <input type="file" className="sr-only" accept="image/*" onChange={e => handleFileChange(e.target.files)}/>
                                                </label>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder={t('imageGenerator.imageInput.urlPlaceholder')} className="flex-grow p-3 bg-secondary dark:bg-dark-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight"/>
                                                    <button onClick={handleUrlLoad} disabled={isLoading} className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-highlight-hover disabled:opacity-50">{t('imageGenerator.imageInput.loadImage')}</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        {/* Prompt Section */}
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">{t('imageGenerator.prompt')}</label>
                            <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder={promptPlaceholder} className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight" />
                        </div>
                        {/* Styles Section */}
                        <div>
                            <label className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">{t('imageGenerator.styles.title')}</label>
                            <div className="flex flex-wrap gap-2">
                                {stylePresets.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => toggleStyle(style.id)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                            activeStyles.has(style.id)
                                                ? 'bg-highlight text-white'
                                                : 'bg-accent dark:bg-dark-accent hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {t(style.labelKey)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Advanced Settings */}
                        <details open={isAdvancedOpen} onToggle={(e) => setIsAdvancedOpen((e.target as HTMLDetailsElement).open)} className="space-y-6 pt-4 border-t border-border dark:border-dark-border">
                            <summary className="cursor-pointer flex justify-between items-center font-bold text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary">
                                {t('imageGenerator.advancedSettings')}
                                <ChevronDownIcon className="w-5 h-5 transition-transform" />
                            </summary>
                            <div className="pt-4 space-y-6">
                                <div>
                                    <label htmlFor="negative-prompt" className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">{t('imageGenerator.negativePrompt')}</label>
                                    <textarea id="negative-prompt" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} rows={2} placeholder={t('imageGenerator.negativePromptPlaceholder')} className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight" />
                                </div>
                                <div className={selectedModel !== 'imagen-4.0-generate-001' ? 'opacity-50' : ''}>
                                    <label htmlFor="numberOfImages" className="block text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">{t('imageGenerator.numberOfImages')}: {numberOfImages}</label>
                                    <input
                                        id="numberOfImages"
                                        type="range"
                                        min="1"
                                        max="4"
                                        step="1"
                                        value={numberOfImages}
                                        onChange={e => setNumberOfImages(parseInt(e.target.value, 10))}
                                        disabled={selectedModel !== 'imagen-4.0-generate-001'}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </details>
                        {/* Generate Button */}
                        <button onClick={handleGenerate} disabled={isLoading || (!prompt.trim() && !imageInput && !pinnedImage)} className="w-full bg-highlight text-white font-bold py-3 px-6 rounded-lg hover:bg-highlight-hover transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg">
                            {isLoading ? `${t('imageGenerator.generating')}...` : t('imageGenerator.generate')}
                        </button>
                    </div>
                </Card>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <Card title={t('imageGenerator.results.title')} headerActions={imageHistory.length > 0 && <button onClick={handleClearHistory} className="text-sm font-medium text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors">{t('imageGenerator.history.clear')}</button>} className="min-h-[500px] flex flex-col">
                    {error && <p className="text-center text-red-500 bg-red-500/10 p-4 rounded-lg">{error}</p>}
                    
                    {isLoading ? (
                         <GeneratingAnimation progress={generationProgress} />
                    ) : imageHistory.length > 0 ? (
                        <div className={`grid ${imageHistory.length > 2 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
                            {imageHistory.map((image) => (
                                <div key={image.id} className="relative group rounded-lg overflow-hidden aspect-square">
                                    <img src={image.url} alt={`Generated image ${image.id}`} className="w-full h-full object-cover"/>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button onClick={() => openModal(image.url)} className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 backdrop-blur-sm" title="Preview">
                                            <EyeIcon className="w-6 h-6" />
                                        </button>
                                        <a href={image.url} download={`masmoo-image-${image.id}.png`} className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 backdrop-blur-sm" title={t('imageGenerator.download')}>
                                            <ArrowDownTrayIcon className="w-6 h-6" />
                                        </a>
                                        {selectedModel === 'gemini-2.5-flash-image' && (
                                            <button onClick={() => handlePin(image)} className={`p-3 rounded-full backdrop-blur-sm transition-colors ${pinnedImage?.id === image.id ? 'bg-highlight/80 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`} title={t('imageGenerator.pin.title')}>
                                                <PinIcon className="w-6 h-6" filled={pinnedImage?.id === image.id} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center flex-grow text-text-secondary dark:text-dark-text-secondary">
                            <PhotoIcon className="w-24 h-24 opacity-20 mb-4"/>
                            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{t('imageGenerator.results.placeholderTitle')}</h3>
                            <p>{t('imageGenerator.results.placeholderSubtitle')}</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

const EyeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default ImageGeneratorPage;