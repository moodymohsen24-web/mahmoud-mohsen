import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { Card } from '../components/ui/Card';
import { SpeakerWaveIcon } from '../components/icons/SpeakerWaveIcon';
import { XCircleIcon } from '../components/icons/XCircleIcon';

const TextToSpeechPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      <Card title={t('tts.title')} titleIcon={<SpeakerWaveIcon className="w-6 h-6" />}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <XCircleIcon className="w-16 h-16 text-red-400/60 mb-4" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {t('tts.error.noKeys')}
            </h3>
        </div>
      </Card>
    </div>
  );
};

export default TextToSpeechPage;
