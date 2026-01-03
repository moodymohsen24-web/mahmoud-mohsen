
import React from 'react';
import type { HistoryItemV2 } from '../../utils/ttsV2Storage';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { ArrowDownTrayIcon } from '../../components/icons/ArrowDownTrayIcon';

interface Props {
    items: HistoryItemV2[];
    onDelete: (id: string) => void;
    onClear: () => void;
    onPlay: (item: HistoryItemV2) => void;
}

export const TTSV2History: React.FC<Props> = ({ items, onDelete, onClear, onPlay }) => {
    if (items.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Generation History</h3>
                <button onClick={onClear} className="text-xs text-red-500 hover:underline">Clear All</button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {items.map(item => (
                    <div key={item.id} className="bg-accent dark:bg-dark-accent p-3 rounded-lg flex items-center justify-between gap-4 group">
                        <div className="flex-grow cursor-pointer" onClick={() => onPlay(item)}>
                            <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary line-clamp-1">{item.text}</p>
                            <div className="flex gap-2 text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                                <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                <span>•</span>
                                <span>{item.voiceName}</span>
                                <span>•</span>
                                <span>{item.modelId}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a 
                                href={URL.createObjectURL(item.blob)} 
                                download={`tts-${item.id}.mp3`}
                                className="p-2 text-highlight hover:bg-highlight/10 rounded-full"
                                title="Download"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            </a>
                            <button 
                                onClick={() => onDelete(item.id)} 
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"
                                title="Delete"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
