
import React, { useRef, useEffect } from 'react';

interface Props {
    audioBlob: Blob | null;
}

export const TTSV2Preview: React.FC<Props> = ({ audioBlob }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const urlRef = useRef<string | null>(null);

    useEffect(() => {
        if (audioBlob) {
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
            const url = URL.createObjectURL(audioBlob);
            urlRef.current = url;
            if (audioRef.current) {
                audioRef.current.src = url;
                audioRef.current.play().catch(e => console.error("Auto-play blocked:", e));
            }
        }
    }, [audioBlob]);

    useEffect(() => {
        return () => {
            if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        };
    }, []);

    if (!audioBlob) return null;

    return (
        <div className="bg-highlight/10 border border-highlight/20 p-4 rounded-lg animate-fade-in-up">
            <h4 className="text-sm font-bold text-highlight mb-2">Generated Audio Preview</h4>
            <audio ref={audioRef} controls className="w-full" />
        </div>
    );
};
