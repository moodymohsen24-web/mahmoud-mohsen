
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';
import { useI18n } from '../hooks/useI18n';
import { Link } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useI18n();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlans = async () => {
            setIsLoading(true);
            try {
                const fetchedPlans = await subscriptionService.getAllPlans();
                setPlans(fetchedPlans);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load subscription plans.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const currentUserPlanId = user?.subscription_plans?.id;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-highlight"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('subscriptionPage.title')}</h1>
                <p className="text-lg text-text-secondary dark:text-dark-text-secondary">{t('subscriptionPage.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-secondary dark:bg-dark-secondary rounded-lg shadow-lg p-8 flex flex-col transition-all duration-300 ${
                            currentUserPlanId === plan.id ? 'border-2 border-highlight scale-105' : 'border border-transparent'
                        }`}
                    >
                        <h2 className="text-2xl font-bold text-highlight dark:text-dark-highlight mb-4">{plan.name}</h2>
                        <p className="text-4xl font-extrabold text-text-primary dark:text-dark-text-primary mb-2">
                            ${plan.price}
                            <span className="text-lg font-medium text-text-secondary dark:text-dark-text-secondary">{t('subscriptionPage.price.month')}</span>
                        </p>
                        <ul className="space-y-3 my-8 flex-grow">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span className="text-text-secondary dark:text-dark-text-secondary">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <Link
                            to={`/checkout/${plan.id}`}
                            className={`w-full block text-center py-3 px-6 rounded-lg font-bold transition-colors text-lg ${
                                currentUserPlanId === plan.id
                                    ? 'bg-accent dark:bg-dark-accent text-text-secondary dark:text-dark-text-secondary cursor-default pointer-events-none'
                                    : 'bg-highlight text-white hover:bg-blue-700'
                            }`}
                        >
                            {currentUserPlanId === plan.id ? t('subscriptionPage.currentPlan') : (plan.price > 0 ? t('subscriptionPage.upgrade') : t('subscriptionPage.getStarted'))}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPage;