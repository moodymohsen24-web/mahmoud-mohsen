import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { Card } from '../components/ui/Card';
import { CodeBracketIcon } from '../components/icons/CodeBracketIcon';

const ExampleCard: React.FC<{
    title: string;
    description: string;
    plain: string;
    ssml: string;
}> = ({ title, description, plain, ssml }) => {
    const { t } = useI18n();
    return (
        <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg border border-border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-highlight dark:text-dark-highlight mb-2">{title}</h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-4 text-sm">{description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-bold mb-2">{t('ssmlGuide.example.plain')}</h4>
                    <pre className="bg-accent dark:bg-dark-accent p-3 rounded-md text-sm whitespace-pre-wrap"><code>{plain}</code></pre>
                </div>
                <div>
                    <h4 className="font-bold mb-2">{t('ssmlGuide.example.ssml')}</h4>
                    <pre className="bg-accent dark:bg-dark-accent p-3 rounded-md text-sm whitespace-pre-wrap"><code>{ssml}</code></pre>
                </div>
            </div>
        </div>
    );
};


const SSMLGuidePage: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('ssmlGuide.title')}</h1>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-8">{t('ssmlGuide.subtitle')}</p>

      <div className="space-y-8">
        <Card>
            <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('ssmlGuide.whatIs.title')}</h2>
            <p className="text-text-secondary dark:text-dark-text-secondary leading-relaxed">{t('ssmlGuide.whatIs.description')}</p>
        </Card>
        
        <Card title={t('ssmlGuide.examples.title')} titleIcon={<CodeBracketIcon className="w-6 h-6"/>}>
            <div className="space-y-6">
                <ExampleCard
                    title={t('ssmlGuide.break.title')}
                    description={t('ssmlGuide.break.description')}
                    plain={t('ssmlGuide.break.plain')}
                    ssml={t('ssmlGuide.break.ssml')}
                />
                <ExampleCard
                    title={t('ssmlGuide.emphasis.title')}
                    description={t('ssmlGuide.emphasis.description')}
                    plain={t('ssmlGuide.emphasis.plain')}
                    ssml={t('ssmlGuide.emphasis.ssml')}
                />
                 <ExampleCard
                    title={t('ssmlGuide.sayAs.title')}
                    description={t('ssmlGuide.sayAs.description')}
                    plain={t('ssmlGuide.sayAs.plain')}
                    ssml={t('ssmlGuide.sayAs.ssml')}
                />
                 <ExampleCard
                    title={t('ssmlGuide.prosody.title')}
                    description={t('ssmlGuide.prosody.description')}
                    plain={t('ssmlGuide.prosody.plain')}
                    ssml={t('ssmlGuide.prosody.ssml')}
                />
            </div>
        </Card>
      </div>
    </div>
  );
};

export default SSMLGuidePage;