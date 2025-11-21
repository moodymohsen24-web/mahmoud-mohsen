
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { imageHistoryService, type HistoryImageRecord } from '../services/imageHistoryService';
import { RectangleStackIcon } from '../components/icons/RectangleStackIcon';
import { ImageGalleryModal } from '../components/ImageGalleryModal';
import { EyeIcon } from '../components/icons/EyeIcon';
import { ClipboardDocumentIcon } from '../components/icons/ClipboardDocumentIcon';
import { CheckIcon } from '../components/icons/CheckIcon';


const ImageGalleryPage: React.FC = () => {
    const { t, language } = useI18n();
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryImageRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [modalState, setModalState] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });
    const [copySuccessId, setCopySuccessId] = useState<string | null>(null);

    const openModal = (imageIndex: number) => setModalState({ isOpen: true, index: imageIndex });
    const closeModal = () => setModalState({ isOpen: false, index: null });

    const handleCopyPrompt = (prompt: string | null, imageId: string) => {
        if (!prompt) return;
        navigator.clipboard.writeText(prompt);
        setCopySuccessId(imageId);
        setTimeout(() => setCopySuccessId(null), 2000);
    };

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            setError('');
            imageHistoryService.getHistory(user.id)
                .then(setHistory)
                .catch(err => {
                    console.error("Failed to load image gallery:", err);
                    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                    setError(`${t('imageGallery.error.load')} - Details: ${errorMessage}`);
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, t]);
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-accent dark:bg-dark-accent rounded-lg animate-pulse" />
                    ))}
                </div>
            );
        }
        
        if (error) {
            return <div className="text-center py-20 text-red-500">{error}</div>;
        }

        if (history.length === 0) {
            return (
                <div className="text-center py-20 bg-secondary dark:bg-dark-secondary rounded-lg">
                    <RectangleStackIcon className="w-20 h-20 mx-auto text-text-secondary dark:text-dark-text-secondary opacity-30 mb-4" />
                    <h2 className="text-xl font-bold">{t('imageGallery.empty.title')}</h2>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-2">{t('imageGallery.empty.subtitle')}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {history.map((image, index) => (
                    <div key={image.id} className="relative group rounded-lg overflow-hidden aspect-square shadow-lg">
                        <img src={image.image_url} alt={image.prompt || 'Generated image'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                           <button onClick={() => openModal(index)} className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 backdrop-blur-sm" title={t('imageGallery.view')}>
                                <EyeIcon className="w-6 h-6" />
                            </button>
                            <button onClick={() => handleCopyPrompt(image.prompt, image.id)} className="bg-white/20 text-white p-3 rounded-full hover:bg-white/30 backdrop-blur-sm" title={t('imageGallery.copyPrompt')}>
                                {copySuccessId === image.id ? <CheckIcon className="w-6 h-6"/> : <ClipboardDocumentIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto">
            {modalState.isOpen && modalState.index !== null && (
                <ImageGalleryModal
                    images={history}
                    initialIndex={modalState.index}
                    onClose={closeModal}
                />
            )}
            <div className="animate-fade-in-down mb-8">
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('imageGallery.title')}</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary">{t('imageGallery.subtitle')}</p>
            </div>
            <div className="animate-fade-in-up">
                {renderContent()}
            </div>
        </div>
    );
};

export default ImageGalleryPage;