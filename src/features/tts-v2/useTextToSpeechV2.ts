
import { useState, useEffect, useCallback } from 'react';
import { elevenLabsServiceV2, type ElevenLabsVoiceV2, type TTSOptionsV2 } from '../../services/elevenLabsServiceV2';
import { ttsV2Storage, type HistoryItemV2 } from '../../utils/ttsV2Storage';
import { v4 as uuidv4 } from 'uuid';

export const useTextToSpeechV2 = () => {
    const [voices, setVoices] = useState<ElevenLabsVoiceV2[]>([]);
    const [history, setHistory] = useState<HistoryItemV2[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingVoices, setIsLoadingVoices] = useState(true);

    const [options, setOptions] = useState<TTSOptionsV2>({
        voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel default
        modelId: 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true
    });

    const [text, setText] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                const [fetchedVoices, storedHistory] = await Promise.all([
                    elevenLabsServiceV2.getVoices(),
                    ttsV2Storage.getAllItems()
                ]);
                setVoices(fetchedVoices);
                setHistory(storedHistory);
            } catch (err) {
                console.error("Failed to init TTS V2", err);
                setError("Failed to load voices or history.");
            } finally {
                setIsLoadingVoices(false);
            }
        };
        init();
    }, []);

    const generateSpeech = async () => {
        if (!text.trim()) return;
        setIsGenerating(true);
        setError(null);

        try {
            const blob = await elevenLabsServiceV2.synthesize(text, options);
            const voice = voices.find(v => v.voice_id === options.voiceId);
            
            const newItem: HistoryItemV2 = {
                id: uuidv4(),
                timestamp: Date.now(),
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                blob,
                voiceName: voice?.name || 'Unknown Voice',
                modelId: options.modelId
            };

            await ttsV2Storage.saveItem(newItem);
            setHistory(prev => [newItem, ...prev]);
            return newItem;
        } catch (err: any) {
            setError(err.message || "Generation failed.");
            throw err;
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteHistoryItem = async (id: string) => {
        await ttsV2Storage.deleteItem(id);
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const clearHistory = async () => {
        await ttsV2Storage.clearAll();
        setHistory([]);
    }

    return {
        voices,
        history,
        text,
        setText,
        options,
        setOptions,
        isGenerating,
        isLoadingVoices,
        error,
        generateSpeech,
        deleteHistoryItem,
        clearHistory
    };
};
