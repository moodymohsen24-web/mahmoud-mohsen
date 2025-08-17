import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type { SubscriptionPlan } from '../types';
import { useI18n } from '../hooks/useI18n';

const PlanForm: React.FC<{
  plan?: SubscriptionPlan | null;
  onSave: (plan: Omit<SubscriptionPlan, 'id'> | SubscriptionPlan) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ plan, onSave, onCancel, isSaving }) => {
  const { t } = useI18n();
  const [name, setName] = useState(plan?.name || '');
  const [price, setPrice] = useState(plan?.price || 0);
  const [features, setFeatures] = useState(plan?.features.join('\n') || '');
  const [isDefault, setIsDefault] = useState(plan?.is_default || false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
        name,
        price,
        features: features.split('\n').filter(f => f.trim() !== ''),
        is_default: isDefault,
        ...(plan && { id: plan.id }),
    };
    onSave(planData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-accent dark:bg-dark-accent p-6 rounded-lg space-y-4 mb-8">
      <h3 className="text-lg font-semibold">{plan ? t('planManagement.editPlan') : t('planManagement.addPlan')}</h3>
      <div>
        <label className="block text-sm font-bold mb-1" htmlFor="planName">{t('planManagement.form.name')}</label>
        <input id="planName" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1" htmlFor="planPrice">{t('planManagement.form.price')}</label>
        <input id="planPrice" type="number" step="0.01" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1" htmlFor="planFeatures">{t('planManagement.form.features')}</label>
        <textarea id="planFeatures" value={features} onChange={e => setFeatures(e.target.value)} rows={4} required className="w-full p-2 bg-secondary dark:bg-dark-secondary rounded-md" />
      </div>
      <div className="flex items-center gap-2">
         <input id="isDefault" type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-highlight focus:ring-highlight"/>
         <label htmlFor="isDefault">{t('planManagement.form.isDefault')}</label>
      </div>
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="py-2 px-4 rounded-md hover:bg-gray-500/10">{t('planManagement.cancel')}</button>
        <button type="submit" disabled={isSaving} className="py-2 px-4 rounded-md bg-highlight text-white hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? t('planManagement.saving') : t('planManagement.save')}
        </button>
      </div>
    </form>
  )
};


const SubscriptionPlanManagement: React.FC = () => {
    const { t } = useI18n();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMutating, setIsMutating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchPlans = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await subscriptionService.getAllPlans();
            setPlans(data);
        } catch (err) {
            setError(t('planManagement.error.fetch'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleSave = async (planData: Omit<SubscriptionPlan, 'id'> | SubscriptionPlan) => {
        setIsMutating(true);
        setError('');
        setSuccess('');
        try {
            if ('id' in planData) {
                await subscriptionService.updatePlan(planData.id, planData);
                setSuccess(t('planManagement.success.update'));
            } else {
                await subscriptionService.createPlan(planData);
                setSuccess(t('planManagement.success.create'));
            }
            setIsFormOpen(false);
            setEditingPlan(null);
            await fetchPlans();
        } catch (err) {
            setError(t('planManagement.error.mutate'));
        } finally {
            setIsMutating(false);
        }
    };

    const handleDelete = async (planId: string) => {
        if (window.confirm(t('planManagement.deleteConfirm'))) {
            setIsMutating(true);
            setError('');
            setSuccess('');
            try {
                await subscriptionService.deletePlan(planId);
                setSuccess(t('planManagement.success.delete'));
                await fetchPlans();
            } catch (err) {
                 setError(t('planManagement.error.mutate'));
            } finally {
                setIsMutating(false);
            }
        }
    };
    
    const handleAddNew = () => {
        setEditingPlan(null);
        setIsFormOpen(true);
    };
    
    const handleEdit = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setIsFormOpen(true);
    }
    
    return (
        <div className="bg-secondary dark:bg-dark-secondary p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('planManagement.title')}</h3>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-6">{t('planManagement.subtitle')}</p>

            {error && <p className="bg-red-500/10 text-red-500 p-3 rounded mb-4">{error}</p>}
            {success && <p className="bg-green-500/10 text-green-500 p-3 rounded mb-4">{success}</p>}

            {!isFormOpen && (
                <div className="flex justify-end mb-4">
                    <button onClick={handleAddNew} className="bg-highlight text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                        {t('planManagement.addPlan')}
                    </button>
                </div>
            )}
            
            {isFormOpen && <PlanForm plan={editingPlan} onSave={handleSave} onCancel={() => setIsFormOpen(false)} isSaving={isMutating} />}

            {isLoading ? <p>Loading...</p> : (
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-accent dark:bg-dark-accent">
                            <tr>
                                <th className="px-6 py-3">{t('planManagement.table.name')}</th>
                                <th className="px-6 py-3">{t('planManagement.table.price')}</th>
                                <th className="px-6 py-3">{t('planManagement.table.features')}</th>
                                <th className="px-6 py-3 text-end">{t('planManagement.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map(plan => (
                                <tr key={plan.id} className="border-b border-accent dark:border-dark-accent">
                                    <td className="px-6 py-4 font-bold">{plan.name}</td>
                                    <td className="px-6 py-4">${plan.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <ul className="list-disc list-inside">
                                            {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 text-end space-x-4">
                                        <button onClick={() => handleEdit(plan)} className="font-medium text-highlight hover:underline">{t('planManagement.edit')}</button>
                                        <button onClick={() => handleDelete(plan.id)} className="font-medium text-red-500 hover:underline">{t('planManagement.delete')}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlanManagement;
