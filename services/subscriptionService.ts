
import { supabase } from '../supabaseClient';
import type { SubscriptionPlan } from '../types';

export const subscriptionService = {
  // Public function to get all available plans
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
    return (data as SubscriptionPlan[]) || [];
  },

  // Admin-only function to create a new plan
  async createPlan(plan: Omit<SubscriptionPlan, 'id'>): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert(plan as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
    return data as SubscriptionPlan;
  },

  // Admin-only function to update a plan
  async updatePlan(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updates as any)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
    return data as SubscriptionPlan;
  },

  // Admin-only function to delete a plan
  async deletePlan(planId: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  },
};
