
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RocketLaunchIcon } from '../components/icons/RocketLaunchIcon';
import { ShieldCheckIcon } from '../components/icons/ShieldCheckIcon';
import { ServerIcon } from '../components/icons/ServerIcon';
import { useI18n } from '../hooks/useI18n';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center">
        <div className="flex-shrink-0 bg-accent dark:bg-dark-accent p-4 rounded-full mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary dark:text-dark-text-secondary">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; }> = ({ quote, author, role }) => (
    <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg">
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
        <section id="pricing" className="py-20 bg-primary dark:bg-dark-primary">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.pricing.title')}</h2>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-2 max-w-2xl mx-auto">{t('home.pricing.subtitle')}</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-secondary dark:bg-dark-secondary rounded-lg shadow-lg p-8 flex flex-col transition-all duration-300 text-center ${!plan.is_default ? 'border-2 border-highlight' : ''}`}
                            >
                                <h3 className="text-2xl font-bold text-highlight dark:text-dark-highlight mb-4">{plan.name}</h3>
                                <p className="text-4xl font-extrabold text-text-primary dark:text-dark-text-primary mb-2">
                                    ${plan.price}
                                    <span className="text-lg font-medium text-text-secondary dark:text-dark-text-secondary">{t('subscriptionPage.price.month')}</span>
                                </p>
                                <ul className="space-y-3 my-8 flex-grow text-start">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            <span className="text-text-secondary dark:text-dark-text-secondary">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/signup"
                                    className={`w-full block py-3 px-6 rounded-lg font-bold transition-colors text-lg ${
                                        !plan.is_default
                                            ? 'bg-highlight text-white hover:bg-blue-700'
                                            : 'bg-highlight/15 text-highlight hover:bg-highlight/25'
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
      {/* Hero Section */}
      <section className="relative text-center py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary dark:from-dark-primary dark:via-dark-secondary dark:to-dark-primary opacity-50"></div>
        <div className="container mx-auto relative">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-fade-in-down">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto mb-8 animate-fade-in-up">
            {t('home.hero.subtitle')}
          </p>
          <Link
            to="/signup"
            className="bg-highlight dark:bg-dark-highlight text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 text-lg inline-block"
          >
            {t('home.hero.cta')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary dark:bg-dark-secondary">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.features.title')}</h2>
            <p className="text-text-secondary dark:text-dark-text-secondary mt-2 max-w-2xl mx-auto">{t('home.features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<RocketLaunchIcon className="w-10 h-10 text-highlight dark:text-dark-highlight" />}
              title={t('home.features.card1.title')}
            >
              {t('home.features.card1.description')}
            </FeatureCard>
            <FeatureCard
              icon={<ShieldCheckIcon className="w-10 h-10 text-highlight dark:text-dark-highlight" />}
              title={t('home.features.card2.title')}
            >
             {t('home.features.card2.description')}
            </FeatureCard>
            <FeatureCard
              icon={<ServerIcon className="w-10 h-10 text-highlight dark:text-dark-highlight" />}
              title={t('home.features.card3.title')}
            >
              {t('home.features.card3.description')}
            </FeatureCard>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-primary dark:bg-dark-primary">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('home.testimonials.title')}</h2>
                  <p className="text-text-secondary dark:text-dark-text-secondary mt-2 max-w-2xl mx-auto">{t('home.testimonials.subtitle')}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <TestimonialCard 
                    quote={t('home.testimonials.card1.quote')}
                    author="Alex Johnson"
                    role={t('home.testimonials.card1.role')}
                  />
                  <TestimonialCard 
                    quote={t('home.testimonials.card2.quote')}
                    author="Maria Garcia"
                    role={t('home.testimonials.card2.role')}
                  />
              </div>
          </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA Section */}
      <section className="py-20 bg-secondary/50 dark:bg-dark-secondary/50">
        <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('home.cta.title')}</h2>
            <p className="text-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto mb-8">
                {t('home.cta.subtitle')}
            </p>
            <Link
                to="/signup"
                className="bg-highlight dark:bg-dark-highlight text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 text-lg inline-block"
            >
                {t('home.cta.button')}
            </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
