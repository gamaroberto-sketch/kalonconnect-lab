"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import { trackActivity } from '../lib/userActivity';

const AuthContext = createContext();

const DEFAULT_VERSION = "PRO";

const normalizeUser = (userData) => {
  if (!userData) return null;
  return {
    ...userData,
    version: (userData.version || DEFAULT_VERSION).toUpperCase(),
    type: userData.type || "professional"
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 AuthContext: useEffect iniciado (Supabase)');
    if (typeof window === "undefined") {
      console.log('🔵 AuthContext: window undefined, setando loading=false');
      setLoading(false);
      return;
    }

    console.log('🔵 AuthContext: Registrando onAuthStateChange (Supabase)');

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 AuthContext: onAuthStateChange disparado, event:', event, 'user:', session?.user?.email || 'null');

      if (session?.user) {
        try {
          console.log('🔵 AuthContext: Chamando /api/auth/sync...');
          // Call API to sync user with database
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
            })
          });

          const data = await response.json();
          console.log('🔵 AuthContext: Resposta do sync:', data.success, data.user);

          if (data.success && data.user) {
            setUser(normalizeUser(data.user));
          } else {
            // Fallback: use Supabase user data
            setUser(normalizeUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
              version: DEFAULT_VERSION,
              type: 'professional'
            }));
          }
        } catch (error) {
          console.error('🔴 AuthContext: Erro no sync:', error);
          // Fallback: use Supabase user data
          setUser(normalizeUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            version: DEFAULT_VERSION,
            type: 'professional'
          }));
        }
      } else {
        console.log('🔵 AuthContext: Sem usuário Supabase');
        setUser(null);
      }
      console.log('🔵 AuthContext: Setando loading=false');
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('🔵 AuthContext: Sessão existente encontrada');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginUser = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Track login activity
      if (data.user) {
        try {
          await trackActivity({
            userId: data.user.id,
            activityType: 'LOGIN',
            metadata: { email: data.user.email },
          });
        } catch (err) {
          console.error('Failed to track login activity:', err);
        }
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      // Create user profile in database
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              email,
              name: userData.name || email.split('@')[0],
              type: userData.type || 'professional',
              version: userData.version || 'NORMAL'
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        } catch (err) {
          console.error('Failed to create user profile:', err);
        }
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Track logout activity before signing out
      if (user) {
        try {
          await trackActivity({
            userId: user.id,
            activityType: 'LOGOUT',
            metadata: { email: user.email },
          });
        } catch (err) {
          console.error('Failed to track logout activity:', err);
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    loginUser,
    registerUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
