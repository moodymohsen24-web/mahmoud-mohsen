
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ServerIcon } from '../components/icons/ServerIcon';
import { useI18n } from '../hooks/useI18n';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { ArrowDownTrayIcon } from '../components/icons/ArrowDownTrayIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode, delay: string }> = ({ icon, title, children, delay }) => (
    <div className="group relative bg-secondary dark:bg-dark-secondary p-8 rounded-3xl border border-border dark:border-dark-border hover:border-highlight/50 dark:hover:border-dark-highlight/50 transition-all duration-500 hover:shadow-xl hover:shadow-highlight/5 animate-fade-in-up flex flex-col items-start text-start" style={{ animationDelay: delay }}>
        <div className="relative z-10 flex-shrink-0 bg-primary dark:bg-dark-primary p-4 rounded-2xl border border-border dark:border-dark-border mb-6 text-highlight dark:text-dark-highlight group-hover:scale-110 transition-transform duration-500 group-hover:bg-highlight group-hover:text-white">
            {icon}
        </div>
        <h3 className="relative z-10 text-xl font-bold text-text-primary dark:text-dark-text-primary mb-3">{title}</h3>
        <p className="relative z-10 text-text-secondary dark:text-dark-text-secondary leading-relaxed text-sm">{children}</p>
    </div>
);

const PricingSection: React.FC = () => {
    const { t } = useI18n();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                const fetchedPlans = await subscriptionService.getAllPlans();
                setPlans(fetchedPlans);
            } catch (err) {
                console.error('Failed to load subscription plans.', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    return (
        <section id="pricing" className="py-32 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-highlight/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20 animate-fade-in-up">
                    <span className="inline-block py-1 px-4 rounded-full bg-highlight/10 text-highlight text-xs font-bold mb-6 uppercase tracking-wider border border-highlight/20">
                        Simple & Transparent
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary dark:text-dark-text-primary mb-6">{t('home.pricing.title')}</h2>
                    <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">{t('home.pricing.subtitle')}</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-highlight"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                        {plans.map((plan, index) => {
                            const isPopular = !plan.is_default && index === 1;
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-3xl flex flex-col transition-all duration-500 border ${
                                        isPopular
                                            ? 'bg-secondary dark:bg-dark-secondary border-highlight shadow-2xl shadow-highlight/20 scale-105 z-10'
                                            : 'bg-secondary/40 dark:bg-dark-secondary/40 border-border dark:border-dark-border hover:border-highlight/30 backdrop-blur-sm'
                                    } p-8 animate-fade-in-up`}
                                    style={{ animationDelay: `${200 + index * 100}ms` }}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-highlight text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                            {t('subscriptionPage.mostPopular')}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-5xl font-extrabold text-text-primary dark:text-dark-text-primary tracking-tight">${plan.price}</span>
                                        <span className="text-text-secondary dark:text-dark-text-secondary font-medium">/ {t('subscriptionPage.price.month')}</span>
                                    </div>
                                    
                                    <div className="w-full h-px bg-border dark:bg-dark-border mb-8" />

                                    <ul className="space-y-4 flex-grow mb-10">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 ${isPopular ? 'bg-highlight text-white' : 'bg-green-500/10 text-green-600'}`}>
                                                    <CheckIcon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-sm text-text-secondary dark:text-dark-text-secondary font-medium">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        to="/signup"
                                        className={`w-full block py-4 px-6 rounded-2xl font-bold text-center transition-all duration-200 active:scale-95 ${
                                            isPopular
                                                ? 'bg-highlight text-white hover:bg-highlight-hover shadow-lg shadow-highlight/20'
                                                : 'bg-primary dark:bg-dark-primary text-text-primary dark:text-dark-text-primary border border-border dark:border-dark-border hover:bg-accent dark:hover:bg-dark-accent'
                                        }`}
                                    >
                                        {t('home.pricing.cta')}
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};


const HomePage: React.FC = () => {
  const { t, language } = useI18n();

  const handleScrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  return (
    <div className="bg-primary dark:bg-dark-primary text-text-primary dark:text-dark-text-primary overflow-x-hidden selection:bg-highlight/30">
      <style>{`
        .mesh-gradient {
            background-image: radial-gradient(at 40% 20%, hsla(228,100%,74%,0.1) 0px, transparent 50%),
                              radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%),
                              radial-gradient(at 0% 50%, hsla(340,100%,76%,0.1) 0px, transparent 50%),
                              radial-gradient(at 80% 50%, hsla(240,100%,70%,0.1) 0px, transparent 50%),
                              radial-gradient(at 0% 100%, hsla(22,100%,77%,0.1) 0px, transparent 50%),
                              radial-gradient(at 80% 100%, hsla(242,100%,70%,0.1) 0px, transparent 50%),
                              radial-gradient(at 0% 0%, hsla(343,100%,76%,0.1) 0px, transparent 50%);
        }
      `}</style>
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 overflow-hidden mesh-gradient">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-gradient-hero pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-8 animate-fade-in-down leading-[1.1]">
                    <span className="block text-text-primary dark:text-dark-text-primary drop-shadow-sm">
                        {t('home.hero.titlePart1')}
                    </span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-highlight via-blue-500 to-purple-600 animate-gradient-x">
                        {t('home.hero.titlePart2')}
                    </span>
                </h1>
                
                <p className="text-xl text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto mb-12 animate-fade-in-down leading-relaxed font-medium" style={{ animationDelay: '200ms' }}>
                    {t('home.hero.subtitle')}
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <Link
                        to="/signup"
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-highlight text-white font-bold text-lg shadow-xl shadow-highlight/20 hover:bg-highlight-hover hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        <span>{t('home.hero.cta')}</span>
                        <ArrowDownTrayIcon className="w-5 h-5 rotate-[-90deg] group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                        onClick={(e) => { e.preventDefault(); handleScrollToSection('showcase'); }}
                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary dark:bg-dark-secondary text-text-primary dark:text-dark-text-primary border border-border dark:border-dark-border font-bold text-lg hover:bg-accent dark:hover:bg-dark-accent hover:-translate-y-1 transition-all duration-300 shadow-sm"
                    >
                        {t('home.hero.viewDemo')}
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className="py-24 bg-secondary/50 dark:bg-dark-secondary/50 border-y border-border dark:border-dark-border relative">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-text-primary dark:text-dark-text-primary mb-4 tracking-tight">{t('home.showcase.title')}</h2>
                <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">{t('home.showcase.subtitle')}</p>
            </div>

            {/* Editor Window */}
            <div className="max-w-6xl mx-auto bg-[#1e1e1e] rounded-2xl shadow-2xl overflow-hidden border border-gray-800 transform hover:scale-[1.005] transition-transform duration-500" dir="ltr">
                {/* Window Header */}
                <div className="bg-[#252526] px-4 py-3 border-b border-[#333] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-2 mr-4">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>
                        <div className="flex gap-1 text-xs font-mono text-gray-400">
                            <span className="bg-[#1e1e1e] px-3 py-1.5 rounded-t-md border-t border-l border-r border-[#333] text-white flex items-center gap-2">
                                <span className="text-blue-400">JSON</span>
                                <span>analysis_result.json</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Editor Body */}
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#333]">
                    {/* Input Pane */}
                    <div className="p-0 relative group font-mono text-sm bg-[#1e1e1e]">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/50 to-transparent opacity-50"></div>
                        <div className="p-4 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-[#333] flex justify-between">
                            <span>Input (Raw Text)</span>
                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Detected Issues</span>
                        </div>
                        <div className="flex min-h-[300px]">
                            <div className="w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end pr-2 pt-4 text-gray-600 select-none">
                                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                            </div>
                            <div className="p-4 text-gray-300 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                {t('home.showcase.beforeText')}
                            </div>
                        </div>
                    </div>

                    {/* Output Pane */}
                    <div className="p-0 relative group font-mono text-sm bg-[#1e1e1e]">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 to-transparent opacity-50"></div>
                        <div className="p-4 text-gray-500 text-xs uppercase tracking-wider font-bold border-b border-[#333] flex justify-between">
                            <span>Output (Processed)</span>
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">AI Enhanced</span>
                        </div>
                        <div className="flex min-h-[300px]">
                            <div className="w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end pr-2 pt-4 text-gray-600 select-none">
                                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                            </div>
                            <div className="p-4 text-gray-100 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ 
                                __html: t('home.showcase.afterText')
                                    .replace(/<ch>/g, '<span class="bg-green-500/20 text-green-400 px-1 rounded border border-green-500/30">')
                                    .replace(/<\/ch>/g, '</span>') 
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-primary dark:bg-dark-primary relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-dark-text-primary mb-6 tracking-tight">{t('home.features.title')}</h2>
            <p className="text-xl text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">{t('home.features.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<SparklesIcon className="w-8 h-8" />}
              title={t('home.features.card1.title')}
              delay="0ms"
            >
              {t('home.features.card1.description')}
            </FeatureCard>
            <FeatureCard
              icon={<ShieldCheckIcon className="w-8 h-8" />}
              title={t('home.features.card2.title')}
              delay="100ms"
            >
             {t('home.features.card2.description')}
            </FeatureCard>
            <FeatureCard
              icon={<ServerIcon className="w-8 h-8" />}
              title={t('home.features.card3.title')}
              delay="200ms"
            >
              {t('home.features.card3.description')}
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-highlight to-purple-600"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="container mx-auto text-center relative z-10 px-6">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">{t('home.cta.title')}</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12 font-medium">
                {t('home.cta.subtitle')}
            </p>
            <Link
                to="/signup"
                className="bg-white text-highlight font-bold py-5 px-12 rounded-full hover:bg-gray-50 transition-all duration-300 hover:scale-105 text-lg inline-flex items-center gap-2 shadow-2xl"
            >
                <span>{t('home.cta.button')}</span>
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
