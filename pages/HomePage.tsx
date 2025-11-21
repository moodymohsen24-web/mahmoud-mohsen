import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ServerIcon } from '../components/icons/ServerIcon';
import { useI18n } from '../hooks/useI18n';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';
import { SparklesIcon } from '../components/icons/SparklesIcon';
import { CheckIcon } from '../components/icons/CheckIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode, delay: string }> = ({ icon, title, children, delay }) => (
    <div className="group relative bg-secondary dark:bg-dark-secondary p-8 rounded-2xl border border-border dark:border-dark-border hover:border-highlight dark:hover:border-dark-highlight transition-all duration-300 hover:shadow-2xl hover:shadow-highlight/10 animate-fade-in-up flex flex-col items-start text-start" style={{ animationDelay: delay }}>
        <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
        <div className="relative z-10 flex-shrink-0 bg-primary dark:bg-dark-primary p-4 rounded-xl border border-border dark:border-dark-border mb-6 text-highlight dark:text-dark-highlight group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="relative z-10 text-xl font-bold text-text-primary dark:text-dark-text-primary mb-3 group-hover:text-highlight dark:group-hover:text-dark-highlight transition-colors">{title}</h3>
        <p className="relative z-10 text-text-secondary dark:text-dark-text-secondary leading-relaxed">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; delay: string }> = ({ quote, author, role, delay }) => (
    <div className="bg-secondary/50 dark:bg-dark-secondary/50 backdrop-blur-md p-8 rounded-2xl border border-border dark:border-dark-border shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in-up" style={{ animationDelay: delay }}>
        <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => <SparklesIcon key={i} className="w-4 h-4 text-yellow-500" />)}
        </div>
        <p className="text-text-primary dark:text-dark-text-primary text-lg italic mb-6 leading-relaxed">"{quote}"</p>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {author.charAt(0)}
            </div>
            <div>
                <p className="font-bold text-text-primary dark:text-dark-text-primary">{author}</p>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{role}</p>
            </div>
        </div>
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
        <section id="pricing" className="py-32 bg-primary dark:bg-dark-primary relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-20 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-highlight/10 text-highlight text-sm font-bold mb-4">
                        Transparent Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary dark:text-dark-text-primary mb-6">{t('home.pricing.title')}</h2>
                    <p className="text-xl text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">{t('home.pricing.subtitle')}</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                        {plans.map((plan, index) => {
                            const isPopular = !plan.is_default && index === 1; // Assume middle plan is popular for design
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl flex flex-col transition-all duration-300 border ${
                                        isPopular
                                            ? 'bg-secondary dark:bg-dark-secondary border-highlight shadow-2xl shadow-highlight/20 scale-105 z-10'
                                            : 'bg-secondary/60 dark:bg-dark-secondary/60 border-border dark:border-dark-border hover:border-highlight/50'
                                    } p-8 animate-fade-in-up`}
                                    style={{ animationDelay: `${200 + index * 100}ms` }}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-highlight to-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                            {t('subscriptionPage.mostPopular')}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-extrabold text-text-primary dark:text-dark-text-primary">${plan.price}</span>
                                        <span className="text-text-secondary dark:text-dark-text-secondary">/ {t('subscriptionPage.price.month')}</span>
                                    </div>
                                    
                                    <div className="w-full h-px bg-border dark:bg-dark-border mb-6" />

                                    <ul className="space-y-4 flex-grow mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className={`mt-1 p-0.5 rounded-full ${isPopular ? 'bg-highlight text-white' : 'bg-accent dark:bg-dark-accent text-text-secondary'}`}>
                                                    <CheckIcon className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm text-text-secondary dark:text-dark-text-secondary leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        to="/signup"
                                        className={`w-full block py-3.5 px-6 rounded-xl font-bold text-center transition-all duration-200 active:scale-95 ${
                                            isPopular
                                                ? 'bg-highlight text-white hover:bg-highlight-hover shadow-lg shadow-highlight/30'
                                                : 'bg-accent dark:bg-dark-accent text-text-primary dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-gray-700'
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
  const { t } = useI18n();
  return (
    <div className="bg-primary dark:bg-dark-primary text-text-primary dark:text-dark-text-primary overflow-x-hidden">
      
      {/* Advanced Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-highlight/10 rounded-full blur-[120px] opacity-60 mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] opacity-50 mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        </div>

        <div className="container mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 dark:bg-dark-secondary/80 border border-highlight/30 backdrop-blur-sm mb-8 animate-fade-in-down shadow-lg shadow-highlight/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-highlight dark:text-dark-highlight tracking-wide">NEW: Gemini 2.5 Integration</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 animate-fade-in-down leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400 text-transparent bg-clip-text">
                    Master Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-highlight to-purple-600 text-transparent bg-clip-text">
                    Arabic Content
                </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto mb-12 animate-fade-in-down leading-relaxed font-medium" style={{ animationDelay: '200ms' }}>
                {t('home.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <Link
                    to="/signup"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-highlight text-white font-bold text-lg shadow-lg shadow-highlight/30 hover:bg-highlight-hover hover:scale-105 transition-all duration-200"
                >
                    {t('home.hero.cta')}
                </Link>
                <a
                    href="#showcase"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-secondary dark:bg-dark-secondary text-text-primary dark:text-dark-text-primary border border-border dark:border-dark-border font-bold text-lg hover:bg-accent dark:hover:bg-dark-accent transition-all duration-200"
                >
                    View Demo
                </a>
            </div>

            {/* Trusted By */}
            <div className="mt-20 pt-10 border-t border-border/50 dark:border-dark-border/50 animate-fade-in" style={{ animationDelay: '600ms' }}>
                <p className="text-sm font-bold text-text-secondary dark:text-dark-text-secondary uppercase tracking-widest mb-6 opacity-60">Trusted by creators worldwide</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-50 dark:invert">
                    {/* Placeholders for logos - simple text for now to keep it clean code-wise */}
                    <span className="text-xl font-bold font-serif">Wired</span>
                    <span className="text-xl font-bold font-sans">TechCrunch</span>
                    <span className="text-xl font-bold font-mono">TheVerge</span>
                    <span className="text-xl font-bold font-serif">Medium</span>
                </div>
            </div>
        </div>
      </section>

      {/* Showcase Section (IDE Style) */}
      <section id="showcase" className="py-24 bg-secondary dark:bg-dark-secondary border-y border-border dark:border-dark-border">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('home.showcase.title')}</h2>
                <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">{t('home.showcase.subtitle')}</p>
            </div>

            <div className="max-w-5xl mx-auto bg-primary dark:bg-[#0d1117] rounded-xl border border-border dark:border-dark-border shadow-2xl overflow-hidden">
                {/* Fake Browser/Editor Header */}
                <div className="bg-accent dark:bg-[#161b22] px-4 py-3 border-b border-border dark:border-dark-border flex items-center gap-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs font-mono text-text-secondary dark:text-dark-text-secondary ml-4">text_analysis.json</div>
                </div>
                
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border dark:divide-dark-border">
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">{t('home.showcase.before')}</h3>
                            <span className="text-xs text-text-secondary dark:text-dark-text-secondary bg-accent dark:bg-dark-accent px-2 py-1 rounded">Raw Input</span>
                        </div>
                        <p className="font-mono text-base leading-loose text-text-secondary dark:text-gray-400 whitespace-pre-wrap">
                            {t('home.showcase.beforeText')}
                        </p>
                    </div>
                    <div className="p-6 md:p-8 bg-green-500/5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-green-600 uppercase tracking-wider">{t('home.showcase.after')}</h3>
                            <span className="text-xs text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Processed</span>
                        </div>
                        <div className="font-mono text-base leading-loose text-text-primary dark:text-dark-text-primary whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: t('home.showcase.afterText').replace(/<ch>/g, '<span class="bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-1 rounded border border-green-300 dark:border-green-700">').replace(/<\/ch>/g, '</span>') }}></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section (Bento Grid) */}
      <section id="features" className="py-32 bg-primary dark:bg-dark-primary relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('home.features.title')}</h2>
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

      {/* Testimonials */}
      <section className="py-32 bg-secondary dark:bg-dark-secondary border-t border-border dark:border-dark-border">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.testimonials.title')}</h2>
                  <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-4 max-w-2xl mx-auto">{t('home.testimonials.subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <TestimonialCard 
                    quote={t('home.testimonials.card1.quote')}
                    author="Alex Johnson"
                    role={t('home.testimonials.card1.role')}
                    delay="0ms"
                  />
                  <TestimonialCard 
                    quote={t('home.testimonials.card2.quote')}
                    author="Maria Garcia"
                    role={t('home.testimonials.card2.role')}
                    delay="200ms"
                  />
              </div>
          </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90 dark:opacity-80"></div>
        <div className="container mx-auto text-center relative z-10 px-6">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">{t('home.cta.title')}</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-12">
                {t('home.cta.subtitle')}
            </p>
            <Link
                to="/signup"
                className="bg-white text-blue-600 font-bold py-4 px-12 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 text-lg inline-block shadow-2xl"
            >
                {t('home.cta.button')}
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;