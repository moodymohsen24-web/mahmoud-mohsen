
import React from 'react';
import type { TTSOptionsV2, ElevenLabsVoiceV2 } from '../../services/elevenLabsServiceV2';
import { Select } from '../../components/ui/Select';
import { Slider } from '../../components/ui/Slider';

interface Props {
    voices: ElevenLabsVoiceV2[];
    options: TTSOptionsV2;
    setOptions: (opt: TTSOptionsV2) => void;
    disabled: boolean;
}

const MODELS = [
    { value: 'eleven_multilingual_v2', label: 'Eleven Multilingual v2' },
    { value: 'eleven_turbo_v2_5', label: 'Eleven Turbo v2.5' },
    { value: 'eleven_flash_v2_5', label: 'Eleven Flash v2.5' },
    { value: 'eleven_monolingual_v1', label: 'Eleven Monolingual v1' },
];

const FORMATS = [
    { value: 'mp3_44100_128', label: 'MP3 44.1kHz 128kbps' },
    { value: 'mp3_44100_192', label: 'MP3 44.1kHz 192kbps' },
    { value: 'pcm_16000', label: 'PCM 16kHz (Raw)' },
];

export const TTSV2Controls: React.FC<Props> = ({ voices, options, setOptions, disabled }) => {
    const voiceOptions = voices.map(v => ({ value: v.voice_id, label: `${v.name} (${v.category || 'Standard'})` }));

    const handleChange = (key: keyof TTSOptionsV2, value: any) => {
        setOptions({ ...options, [key]: value });
    };

    return (
        <div className="space-y-6 bg-secondary dark:bg-dark-secondary p-6 rounded-lg border border-border dark:border-dark-border">
            <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Voice"
                    options={voiceOptions}
                    value={options.voiceId}
                    onChange={(e) => handleChange('voiceId', e.target.value)}
                    disabled={disabled}
                />
                <Select
                    label="Model"
                    options={MODELS}
                    value={options.modelId}
                    onChange={(e) => handleChange('modelId', e.target.value)}
                    disabled={disabled}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Slider
                    label="Stability"
                    valueLabel={options.stability.toFixed(2)}
                    min="0" max="1" step="0.01"
                    value={options.stability}
                    onChange={(e) => handleChange('stability', parseFloat(e.target.value))}
                    disabled={disabled}
                    description="Higher stability = more consistent, less emotion."
                />
                <Slider
                    label="Similarity Boost"
                    valueLabel={options.similarityBoost.toFixed(2)}
                    min="0" max="1" step="0.01"
                    value={options.similarityBoost}
                    onChange={(e) => handleChange('similarityBoost', parseFloat(e.target.value))}
                    disabled={disabled}
                    description="Higher boost = clearer voice, potential artifacts."
                />
                <Slider
                    label="Style Exaggeration"
                    valueLabel={options.style.toFixed(2)}
                    min="0" max="1" step="0.01"
                    value={options.style}
                    onChange={(e) => handleChange('style', parseFloat(e.target.value))}
                    disabled={disabled}
                    description="Amplifies the speaker's style."
                />
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-text-secondary dark:text-dark-text-secondary">Output Format</label>
                    <select 
                        value={options.outputFormat} 
                        onChange={(e) => handleChange('outputFormat', e.target.value)}
                        className="bg-accent dark:bg-dark-accent rounded p-2 text-sm"
                        disabled={disabled}
                    >
                        {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    id="speakerBoost" 
                    checked={options.useSpeakerBoost} 
                    onChange={(e) => handleChange('useSpeakerBoost', e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 text-highlight bg-accent border-gray-300 rounded focus:ring-highlight"
                />
                <label htmlFor="speakerBoost" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">Enable Speaker Boost</label>
            </div>
        </div>
    );
};
