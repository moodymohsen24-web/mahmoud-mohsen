
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { User, AuthContextType } from '../types';
import type { Session } from '@supabase/supabase-js';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async (session: Session | null) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select(`*, subscription_plans(*)`)
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
            setUser(profile as unknown as User);
        }
      }
      setIsLoading(false);
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
        checkSession(session);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
            setUser(null);
        } else {
            checkSession(session);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };
  
  const isAuthenticated = !!user;

  const value = { user, logout, isAuthenticated, isLoading, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
