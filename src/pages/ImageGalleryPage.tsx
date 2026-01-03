
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { imageHistoryService, type HistoryImageRecord } from '../services/imageHistoryService';
import { RectangleStackIcon } from '../components/icons/RectangleStackIcon';
import { ImageGalleryModal } from '../components/ImageGalleryModal';
import { EyeIcon } from '../components/icons/EyeIcon';

const ImageGalleryPage: React.FC = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryImageRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [modalState, setModalState] = useState<{ isOpen: boolean; index: number | null }>({ isOpen: false, index: null });

    const fetchPage = async (pageNum: number) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { data, total } = await imageHistoryService.getHistory(user.id, pageNum, 20);
            if (pageNum === 1) setHistory(data);
            else setHistory(prev => [...prev, ...data]);
            
            setHasMore(history.length + data.length < total);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPage(1);
    }, [user]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPage(nextPage);
    };

    return (
        <div className="container mx-auto pb-10">
            {modalState.isOpen && modalState.index !== null && (
                <ImageGalleryModal images={history} initialIndex={modalState.index} onClose={() => setModalState({ isOpen: false, index: null })} />
            )}
            <h1 className="text-3xl font-bold mb-6 text-text-primary dark:text-dark-text-primary">{t('imageGallery.title')}</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {history.map((image, index) => (
                    <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden bg-accent dark:bg-dark-accent">
                        <img src={image.image_url} loading="lazy" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <button 
                            onClick={() => setModalState({ isOpen: true, index })} 
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                            <EyeIcon className="w-8 h-8 text-white" />
                        </button>
                    </div>
                ))}
            </div>

            {isLoading && <div className="text-center py-8">Loading...</div>}
            
            {!isLoading && hasMore && (
                <div className="text-center mt-8">
                    <button onClick={loadMore} className="bg-highlight text-white px-6 py-2 rounded-lg hover:bg-highlight-hover">
                        Load More
                    </button>
                </div>
            )}
            
            {!isLoading && history.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <RectangleStackIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>{t('imageGallery.empty.title')}</p>
                </div>
            )}
        </div>
    );
};

export default ImageGalleryPage;
