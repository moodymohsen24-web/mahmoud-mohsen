import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';
import { supabase } from '../supabaseClient';

const CheckoutPage: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const { t } = useI18n();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) {
                navigate('/subscription');
                return;
            }
            setIsLoading(true);
            try {
                // In a real app, you might fetch a single plan, but for simplicity
                // we fetch all and find the one. This is okay for a small number of plans.
                const allPlans = await subscriptionService.getAllPlans();
                const selectedPlan = allPlans.find(p => p.id === planId);
                if (selectedPlan) {
                    setPlan(selectedPlan);
                } else {
                    setError('Plan not found.');
                    setTimeout(() => navigate('/subscription'), 2000);
                }
            } catch (err) {
                setError('Failed to load plan details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlan();
    }, [planId, navigate]);

    const handlePayPalCheckout = async () => {
        if (!planId) return;
        setIsProcessing(true);
        setError('');

        try {
            const { data, error: invokeError } = await supabase.functions.invoke('create-paypal-order', {
                body: { plan_id: planId },
            });
            
            if (invokeError) throw invokeError;

            // The Edge Function itself might return an error in its body
            if (data.error) throw new Error(data.error);

            if (data && data.approval_url) {
                window.location.href = data.approval_url;
            } else {
                throw new Error('Could not get PayPal approval URL.');
            }

        } catch (err) {
            console.error('Checkout error:', err);
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            setError(`${t('checkoutPage.error')} ${errorMessage}`);
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-highlight"></div>
            </div>
        );
    }
    
    if (error && !plan) {
        return (
            <div className="container mx-auto text-center py-20">
                <p className="text-red-500">{error || 'Could not load plan.'}</p>
            </div>
        );
    }
    
    if (!plan) return null;


    return (
        <div className="container mx-auto max-w-lg px-6 py-12">
            <h1 className="text-3xl font-bold text-center mb-8">{t('checkoutPage.title')}</h1>
            <div className="bg-secondary dark:bg-dark-secondary p-8 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-6">{t('checkoutPage.orderSummary')}</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-text-secondary dark:text-dark-text-secondary">{t('checkoutPage.plan')}:</span>
                        <span className="font-bold text-lg">{plan.name}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-text-secondary dark:text-dark-text-secondary">{t('checkoutPage.price')}:</span>
                        <span className="font-bold text-lg">${plan.price.toFixed(2)} {t('subscriptionPage.price.month')}</span>
                    </div>
                </div>
                 <hr className="my-6 border-accent dark:border-dark-accent" />
                 <button
                    onClick={handlePayPalCheckout}
                    disabled={isProcessing}
                    className="w-full bg-[#0070ba] text-white font-bold py-3 rounded-lg hover:bg-[#005ea6] transition-colors disabled:opacity-50"
                 >
                    {isProcessing ? t('checkoutPage.processing') : t('checkoutPage.payWithPayPal')}
                 </button>
                 {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
            </div>
        </div>
    );
};

export default CheckoutPage;