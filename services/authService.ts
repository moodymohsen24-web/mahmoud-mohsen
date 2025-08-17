
import { supabase } from '../supabaseClient';
import type { UserRole } from '../types';

export const authService = {
  async signUp(name: string, email: string, password_hash: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password_hash,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async login(email: string, password_hash: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password_hash,
    });
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, name: string, email: string, newPassword?: string) {
      const profileUpdateData: { name: string, email?: string } = { name };
      if (email) profileUpdateData.email = email;

      // Update user name and email in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData as any)
        .eq('id', userId);
      if (profileError) throw profileError;

      // Update email and password in auth.users
      const authUpdateData: { email?: string; password?: string } = {};
      if (email) authUpdateData.email = email;
      if (newPassword) authUpdateData.password = newPassword;

      if(Object.keys(authUpdateData).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdateData);
        if (authError) throw authError;
      }
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    if (error) throw error;
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  // Admin Functions
  async getAllUsers() {
    const { data, error } = await supabase.from('profiles').select('*, subscription_plans(*)');
    if (error) throw error;
    return data || [];
  },

  async updateUserRoleAndPlan(userIdToUpdate: string, newRole: UserRole, newPlanId: string | null) {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, subscription_plan_id: newPlanId } as any)
      .eq('id', userIdToUpdate);
    if (error) throw error;
  },

  async deleteUser(userIdToDelete: string) {
    // Call the database function to securely and completely delete the user.
    const { error } = await supabase.rpc('delete_user_by_id', {
      user_id: userIdToDelete,
    });
    if (error) throw error;
  },
};
