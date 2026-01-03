
import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { PhotoIcon } from '../components/icons/PhotoIcon';
import { XMarkIcon } from '../components/icons/XMarkIcon';
import { EyeIcon } from '../components/icons/EyeIcon';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { PinIcon } from '../components/icons/PinIcon';
import GeneratingAnimation from '../components/GeneratingAnimation';
import { imageHistoryService, type HistoryImageRecord } from '../services/imageHistoryService';
import { ImageGalleryModal } from '../components/ImageGalleryModal';
import { ClipboardDocumentIcon } from '../components/icons/ClipboardDocumentIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { useImageGeneration } from '../hooks/useImageGeneration';

const ImageGeneratorPage: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set());
    
    const [imageInput, setImageInput] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null);
    const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState('');

    const [imageHistory, setImageHistory] = useState<HistoryImageRecord[]>([]);
    const [pinnedImage, setPinnedImage] = useState<HistoryImageRecord | null>(null);
    
    const [modalState, setModalState] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

    const [selectedModel, setSelectedModel] = useState<'gemini-2.5-flash-image' | 'imagen-4.0-generate-001'>('gemini-2.5-flash-image');
    const [numberOfImages, setNumberOfImages] = useState(1);

    const { generate, isLoading, error, progress, setError } = useImageGeneration(user?.id);

    // Pagination for history
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (user) {
            loadHistory(1, true);
        }
    }, [user]);

    const loadHistory = async (pageNum: number, reset: boolean = false) => {
        if (!user) return;
        try {
            const { data, total } = await imageHistoryService.getHistory(user.id, pageNum, 8); // Smaller page size for generator widget
            if (reset) {
                setImageHistory(data);
            } else {
                setImageHistory(prev => [...prev, ...data]);
            }
            setHasMore(imageHistory.length + data.length < total);
            setPage(pageNum);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    };

    const handleGenerate = async () => {
        if (!user) return;
        try {
            const newImages = await generate(prompt, negativePrompt, selectedModel, numberOfImages, activeStyles, imageInput ? { base64: imageInput.base64, mimeType: imageInput.mimeType } : undefined, pinnedImage);
            if (newImages) {
                setImageHistory(prev => [...newImages, ...prev]);
            }
        } catch (e) {
            // Error handled in hook
        }
    };

    const handleFileChange = async (files: FileList | null) => {
        if (files && files[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = () => {
                const res = reader.result as string;
                setImageInput({ base64: res.split(',')[1], mimeType: files[0].type, previewUrl: res });
            };
        }
    };

    // ... (Helper functions: toggleStyle, removeImage, handlePin, etc. remain similar but using new state)
    const toggleStyle = (style: string) => {
        setActiveStyles(prev => {
            const newStyles = new Set(prev);
            if (newStyles.has(style)) newStyles.delete(style); else newStyles.add(style);
            return newStyles;
        });
    };
    const removeImage = () => { setImageInput(null); setImageUrl(''); };
    const handlePin = (image: HistoryImageRecord) => setPinnedImage(prev => prev?.id === image.id ? null : image);
    const openModal = (index: number) => setModalState({ isOpen: true, index });
    const closeModal = () => setModalState({ isOpen: false, index: null });

    const stylePresets = [
        { id: 'cinematic', labelKey: 'imageGenerator.styles.cinematic' },
        { id: 'photographic', labelKey: 'imageGenerator.styles.photographic' },
        { id: 'anime', labelKey: 'imageGenerator.styles.anime' },
        { id: '3d model', labelKey: 'imageGenerator.styles.3d' },
    ];

    return (
        <div className="container mx-auto space-y-8">
            {modalState.isOpen && modalState.index !== null && (
                <ImageGalleryModal images={imageHistory} initialIndex={modalState.index} onClose={closeModal} />
            )}
            <div className="animate-fade-in-down">
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('imageGenerator.title')}</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <div className="space-y-4">
                            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value as any)} className="w-full p-2 bg-accent dark:bg-dark-accent rounded-lg">
                                <option value="gemini-2.5-flash-image">Gemini 2.5 Flash</option>
                                <option value="imagen-4.0-generate-001">Imagen 4</option>
                            </select>

                            {selectedModel === 'gemini-2.5-flash-image' && (
                                <div className="p-4 bg-accent dark:bg-dark-accent rounded-lg border border-dashed border-border dark:border-dark-border text-center">
                                    {imageInput ? (
                                        <div className="relative">
                                            <img src={imageInput.previewUrl} className="h-32 mx-auto rounded" />
                                            <button onClick={removeImage} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"><XMarkIcon className="w-4 h-4"/></button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <PhotoIcon className="w-8 h-8 mx-auto mb-2 text-text-secondary"/>
                                            <span className="text-xs">{t('imageGenerator.imageInput.uploadCta')}</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e.target.files)}/>
                                        </label>
                                    )}
                                </div>
                            )}

                            <textarea 
                                value={prompt} 
                                onChange={e => setPrompt(e.target.value)} 
                                rows={4} 
                                placeholder={t('imageGenerator.promptPlaceholder')} 
                                className="w-full p-3 bg-accent dark:bg-dark-accent rounded-lg" 
                            />

                            <div className="flex flex-wrap gap-2">
                                {stylePresets.map(style => (
                                    <button 
                                        key={style.id} 
                                        onClick={() => toggleStyle(style.id)} 
                                        className={`px-2 py-1 text-xs rounded-full border ${activeStyles.has(style.id) ? 'bg-highlight text-white border-highlight' : 'border-border'}`}
                                    >
                                        {t(style.labelKey)}
                                    </button>
                                ))}
                            </div>

                            <button onClick={handleGenerate} disabled={isLoading || (!prompt && !imageInput)} className="w-full bg-highlight text-white font-bold py-3 rounded-lg hover:bg-highlight-hover disabled:opacity-50">
                                {isLoading ? t('imageGenerator.generating') : t('imageGenerator.generate')}
                            </button>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        </div>
                    </Card>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <Card title={t('imageGenerator.results.title')} className="min-h-[500px]">
                        {isLoading && <GeneratingAnimation progress={progress} />}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {imageHistory.map((img, idx) => (
                                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-black/10">
                                    <img src={img.image_url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                        <button onClick={() => openModal(idx)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><EyeIcon className="w-5 h-5"/></button>
                                        {selectedModel === 'gemini-2.5-flash-image' && <button onClick={() => handlePin(img)} className={`p-2 rounded-full text-white ${pinnedImage?.id === img.id ? 'bg-highlight' : 'bg-white/20 hover:bg-white/40'}`}><PinIcon className="w-5 h-5"/></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorPage;
