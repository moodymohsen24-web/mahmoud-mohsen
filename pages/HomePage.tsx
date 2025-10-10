import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ServerIcon } from '../components/icons/ServerIcon';
import { useI18n } from '../hooks/useI18n';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';
import { HeroIllustration } from '../components/HeroIllustration';
import { SparklesIcon } from '../components/icons/SparklesIcon';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode, delay: string }> = ({ icon, title, children, delay }) => (
    <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-xl shadow-card-shadow dark:shadow-card-shadow-dark text-center transform hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: delay }}>
        <div className="flex-shrink-0 bg-highlight/10 p-4 rounded-full mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary dark:text-dark-text-secondary">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; delay: string }> = ({ quote, author, role, delay }) => (
    <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-xl shadow-card-shadow dark:shadow-card-shadow-dark animate-fade-in-up" style={{ animationDelay: delay }}>
        <p className="text-text-secondary dark:text-dark-text-secondary italic mb-6">"{quote}"</p>
        <div className="text-start">
            <p className="font-bold text-text-primary dark:text-dark-text-primary">{author}</p>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{role}</p>
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
        <section id="pricing" className="py-24 bg-primary dark:bg-dark-primary">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.pricing.title')}</h2>
                    <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-4 max-w-2xl mx-auto">{t('home.pricing.subtitle')}</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.id}
                                className={`relative bg-secondary dark:bg-dark-secondary rounded-xl shadow-card-shadow dark:shadow-card-shadow-dark p-8 flex flex-col transition-all duration-300 text-center border animate-fade-in-up ${!plan.is_default ? 'border-2 border-highlight' : 'border border-border dark:border-dark-border'}`}
                                style={{ animationDelay: `${200 + index * 150}ms` }}
                            >
                                {!plan.is_default && (
                                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-highlight text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('subscriptionPage.mostPopular')}</div>
                                )}
                                <h3 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{plan.name}</h3>
                                <p className="text-5xl font-extrabold text-text-primary dark:text-dark-text-primary mb-2">
                                    ${plan.price}
                                    <span className="text-base font-medium text-text-secondary dark:text-dark-text-secondary">{t('subscriptionPage.price.month')}</span>
                                </p>
                                <ul className="space-y-4 my-8 flex-grow text-start">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            <span className="text-text-secondary dark:text-dark-text-secondary">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/signup"
                                    className={`w-full block py-3 px-6 rounded-lg font-bold transition-all duration-200 text-lg active:scale-95 ${
                                        !plan.is_default
                                            ? 'bg-highlight text-white hover:bg-highlight-hover shadow-md'
                                            : 'bg-accent text-highlight hover:bg-slate-200 dark:bg-dark-accent dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {t('home.pricing.cta')}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};


const HomePage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="bg-primary dark:bg-dark-primary text-text-primary dark:text-dark-text-primary">
        <style>{`
            #showcase ch {
                background-color: rgba(59, 130, 246, 0.15);
                color: #1d4ed8;
                border-radius: 4px;
                padding: 1px 3px;
            }
            .dark #showcase ch {
                background-color: rgba(96, 165, 250, 0.2);
                color: #93c5fd;
            }
        `}</style>
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 z-0">
          <div className="absolute circle-1 w-96 h-96 bg-blue-200 dark:bg-blue-900/50 rounded-full -top-20 -left-40 opacity-50 blur-3xl"></div>
          <div className="absolute circle-2 w-96 h-96 bg-purple-200 dark:bg-purple-900/50 rounded-full -bottom-20 -right-40 opacity-50 blur-3xl"></div>
        </div>
        <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-start">
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-down bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 text-transparent bg-clip-text" style={{ animationDelay: '200ms' }}>
                        {t('home.hero.title')}
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary dark:text-dark-text-secondary max-w-xl mx-auto lg:mx-0 mb-10 animate-fade-in-down" style={{ animationDelay: '400ms' }}>
                        {t('home.hero.subtitle')}
                    </p>
                    <Link
                        to="/signup"
                        className="bg-highlight text-white font-bold py-4 px-10 rounded-full hover:bg-highlight-hover transition-all duration-300 transform hover:scale-105 text-lg inline-block shadow-lg shadow-highlight/30 animate-fade-in-up active:scale-95"
                        style={{ animationDelay: '600ms' }}
                    >
                        {t('home.hero.cta')}
                    </Link>
                </div>
                <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <HeroIllustration />
                </div>
            </div>
        </div>
      </section>

      {/* Text Showcase Section */}
      <section id="showcase" className="py-24 bg-secondary dark:bg-dark-secondary border-y border-border dark:border-dark-border">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in-up">
                <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.showcase.title')}</h2>
                <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-4 max-w-3xl mx-auto">{t('home.showcase.subtitle')}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 bg-primary dark:bg-dark-primary p-6 sm:p-8 rounded-xl border border-border dark:border-dark-border animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div>
                     <h3 className="font-bold mb-4 text-lg text-red-500">{t('home.showcase.before')}</h3>
                     <div className="bg-secondary dark:bg-dark-secondary p-4 rounded-md text-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap font-mono text-sm leading-relaxed h-full">
                        {t('home.showcase.beforeText')}
                     </div>
                </div>
                <div>
                     <h3 className="font-bold mb-4 text-lg text-green-500">{t('home.showcase.after')}</h3>
                     <div className="bg-secondary dark:bg-dark-secondary p-4 rounded-md text-text-primary dark:text-dark-text-primary whitespace-pre-wrap font-mono text-sm leading-relaxed h-full">
                        <p dangerouslySetInnerHTML={{ __html: t('home.showcase.afterText') }}></p>
                     </div>
                </div>
            </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-24 bg-primary dark:bg-dark-primary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.features.title')}</h2>
            <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-4 max-w-2xl mx-auto">{t('home.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<SparklesIcon className="w-10 h-10 text-highlight dark:text-dark-highlight" />}
              title={t('home.features.card1.title')}
              delay="200ms"
            >
              {t('home.features.card1.description')}
            </FeatureCard>
            <FeatureCard
              icon={<ShieldCheckIcon className="w-10 h-10 text-highlight dark:text-dark-highlight" />}
              title={t('home.features.card2.title')}
              delay="350ms"
            >
             {t('home.features.card2.description')}
            </FeatureCard>
            <FeatureCard
              icon={<ServerIcon className="w-10 h-10 text-highlight dark:text-dark-highlight" />}
              title={t('home.features.card3.title')}
              delay="500ms"
            >
              {t('home.features.card3.description')}
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
        <section id="how-it-works" className="py-24 bg-secondary dark:bg-dark-secondary border-y border-border dark:border-dark-border">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.howItWorks.title')}</h2>
                    <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-4 max-w-2xl mx-auto">{t('home.howItWorks.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative max-w-5xl mx-auto">
                    {/* Dashed line connector for desktop */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-12">
                        <svg width="100%" height="100%" className="overflow-visible">
                            <line x1="20%" y1="0" x2="80%" y2="0" strokeWidth="2" stroke="currentColor" className="text-border dark:text-dark-border" strokeDasharray="8 8" />
                        </svg>
                    </div>

                    <div className="relative animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                         <div className="flex items-center justify-center h-20 w-20 mx-auto mb-6 bg-secondary dark:bg-dark-secondary rounded-full border-4 border-highlight/20 dark:border-dark-highlight/20 text-highlight dark:text-dark-highlight font-extrabold text-3xl z-10 relative">1</div>
                         <h3 className="text-xl font-bold mb-2">{t('home.howItWorks.step1.title')}</h3>
                         <p className="text-text-secondary dark:text-dark-text-secondary px-4">{t('home.howItWorks.step1.description')}</p>
                    </div>
                    <div className="relative animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                         <div className="flex items-center justify-center h-20 w-20 mx-auto mb-6 bg-secondary dark:bg-dark-secondary rounded-full border-4 border-highlight/20 dark:border-dark-highlight/20 text-highlight dark:text-dark-highlight font-extrabold text-3xl z-10 relative">2</div>
                         <h3 className="text-xl font-bold mb-2">{t('home.howItWorks.step2.title')}</h3>
                         <p className="text-text-secondary dark:text-dark-text-secondary px-4">{t('home.howItWorks.step2.description')}</p>
                    </div>
                    <div className="relative animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                         <div className="flex items-center justify-center h-20 w-20 mx-auto mb-6 bg-secondary dark:bg-dark-secondary rounded-full border-4 border-highlight/20 dark:border-dark-highlight/20 text-highlight dark:text-dark-highlight font-extrabold text-3xl z-10 relative">3</div>
                         <h3 className="text-xl font-bold mb-2">{t('home.howItWorks.step3.title')}</h3>
                         <p className="text-text-secondary dark:text-dark-text-secondary px-4">{t('home.howItWorks.step3.description')}</p>
                    </div>
                </div>
            </div>
        </section>
      
      {/* Testimonials Section */}
      <section className="py-24 bg-primary dark:bg-dark-primary">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16 animate-fade-in-up">
                  <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.testimonials.title')}</h2>
                  <p className="text-lg text-text-secondary dark:text-dark-text-secondary mt-4 max-w-2xl mx-auto">{t('home.testimonials.subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  <TestimonialCard 
                    quote={t('home.testimonials.card1.quote')}
                    author="Alex Johnson"
                    role={t('home.testimonials.card1.role')}
                    delay="200ms"
                  />
                  <TestimonialCard 
                    quote={t('home.testimonials.card2.quote')}
                    author="Maria Garcia"
                    role={t('home.testimonials.card2.role')}
                    delay="350ms"
                  />
              </div>
          </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA Section */}
      <section className="py-24 bg-secondary/50 dark:bg-dark-secondary/50 border-t border-border dark:border-dark-border">
        <div className="container mx-auto text-center animate-fade-in-up">
            <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('home.cta.title')}</h2>
            <p className="text-lg text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto mb-8">
                {t('home.cta.subtitle')}
            </p>
            <Link
                to="/signup"
                className="bg-highlight text-white font-bold py-4 px-10 rounded-full hover:bg-highlight-hover transition-all duration-300 transform hover:scale-105 text-lg inline-block shadow-lg shadow-highlight/30 active:scale-95"
            >
                {t('home.cta.button')}
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;