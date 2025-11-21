
import React, { useState, useEffect } from 'react';
import type { HistoryImageRecord } from '../services/imageHistoryService';
import { useI18n } from '../hooks/useI18n';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { ClipboardDocumentIcon } from './icons/ClipboardDocumentIcon';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

interface ImageGalleryModalProps {
  images: HistoryImageRecord[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ images, initialIndex, onClose }) => {
  const { t, language } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [copySuccess, setCopySuccess] = useState(false);

  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]); // Re-bind if index or length changes

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };
  
  const handleCopyPrompt = () => {
      if (!currentImage.prompt) return;
      navigator.clipboard.writeText(currentImage.prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(date);
  };


  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
        {/* Main Image and Navigation */}
        <div className="relative flex items-center justify-center w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && (
                <button onClick={handlePrev} className="absolute left-0 -translate-x-12 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors">
                    <ChevronLeftIcon className="w-8 h-8"/>
                </button>
            )}
            <img src={currentImage.image_url} alt={currentImage.prompt || 'Generated image'} className="max-w-[80vw] max-h-[70vh] object-contain rounded-lg shadow-2xl" />
            {images.length > 1 && (
                 <button onClick={handleNext} className="absolute right-0 translate-x-12 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors">
                    <ChevronRightIcon className="w-8 h-8"/>
                </button>
            )}
        </div>

        {/* Details Panel */}
        <div className="bg-secondary dark:bg-dark-secondary rounded-lg shadow-xl w-full max-w-3xl p-4 text-sm text-text-secondary dark:text-dark-text-secondary animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <strong className="text-text-primary dark:text-dark-text-primary">{t('imageGallery.modal.prompt')}:</strong>
                    <p className="mt-1 font-mono bg-accent dark:bg-dark-accent p-2 rounded text-xs max-h-24 overflow-y-auto">{currentImage.prompt || 'N/A'}</p>
                </div>
                <div>
                     <p><strong className="text-text-primary dark:text-dark-text-primary">{t('imageGallery.modal.model')}:</strong> {currentImage.model_used || 'N/A'}</p>
                     <p><strong className="text-text-primary dark:text-dark-text-primary">{t('imageGallery.modal.createdAt')}:</strong> {formatTimestamp(currentImage.created_at)}</p>
                </div>
            </div>
             <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border dark:border-dark-border">
                <button onClick={handleCopyPrompt} disabled={!currentImage.prompt} className="flex items-center gap-2 py-2 px-4 rounded-md bg-accent dark:bg-dark-accent hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
                    <ClipboardDocumentIcon className="w-5 h-5" />
                    {copySuccess ? t('imageGallery.modal.copySuccess') : t('imageGallery.modal.copyPrompt')}
                </button>
                <a href={currentImage.image_url} download={`masmoo-image-${currentImage.id}.png`} className="flex items-center gap-2 py-2 px-4 rounded-md bg-accent dark:bg-dark-accent hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    {t('imageGenerator.download')}
                </a>
             </div>
        </div>
      </div>
       <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 text-white rounded-full p-1.5 hover:scale-110 transition-transform backdrop-blur-sm">
            <XMarkIcon className="w-6 h-6" />
        </button>
    </div>
  );
};
