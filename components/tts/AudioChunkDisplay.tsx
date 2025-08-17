import React, { useRef, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { TTSResponseChunk } from '../../types';

// Icons
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.539 0 3.286L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M6.75 5.25a.75.75 0 00-1.5 0v13.5a.75.75 0 001.5 0V5.25zm9 0a.75.75 0 00-1.5 0v13.5a.75.75 0 001.5 0V5.25z" clipRule="evenodd" /></svg>;
const ArrowDownTrayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;


interface AudioChunkDisplayProps {
  chunk: TTSResponseChunk;
  isPlaying: boolean;
  onPlayToggle: (chunkId: string) => void;
  audioBlob: Blob | null;
}

export const AudioChunkDisplay: React.FC<AudioChunkDisplayProps> = ({ chunk, isPlaying, onPlayToggle, audioBlob }) => {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      if (isPlaying) {
        audioElement.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioElement.pause();
      }
    }
  }, [isPlaying]);
  
  const handleEnded = () => {
    onPlayToggle(chunk.id); // Toggle off when done
  };

  return (
    <div className="bg-accent dark:bg-dark-accent p-4 rounded-lg flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPlayToggle(chunk.id)}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-highlight text-white hover:bg-blue-700 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <PauseIcon/> : <PlayIcon/>}
        </button>
        <div className="font-medium text-text-primary dark:text-dark-text-primary">{chunk.filename}</div>
      </div>
      <a
        href={chunk.audioUrl}
        download={chunk.filename}
        className="flex items-center gap-2 py-2 px-3 rounded-md text-text-secondary dark:text-dark-text-secondary bg-secondary dark:bg-dark-secondary hover:bg-gray-200 dark:hover:bg-dark-accent/80 transition-colors"
        title={t('tts.button.download')}
      >
        <ArrowDownTrayIcon />
        <span className="hidden sm:inline">{t('tts.button.download')}</span>
      </a>
      <audio
        ref={audioRef}
        src={chunk.audioUrl}
        onEnded={handleEnded}
        onPause={() => { if(isPlaying) onPlayToggle(chunk.id) }} // Sync state if user uses native controls
        className="hidden"
      />
    </div>
  );
};