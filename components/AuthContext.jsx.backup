"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
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
    console.log('🔵 AuthContext: useEffect iniciado');
    if (typeof window === "undefined") {
      console.log('🔵 AuthContext: window undefined, setando loading=false');
      setLoading(false);
      return;
    }

    console.log('🔵 AuthContext: Registrando onAuthStateChanged');
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔵 AuthContext: onAuthStateChanged disparado, user:', firebaseUser?.email || 'null');
      if (firebaseUser) {
        try {
          console.log('🔵 AuthContext: Chamando /api/auth/sync...');
          // Call API to sync user with Supabase (bypassing RLS)
          const response = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            })
          });

          const data = await response.json();
          console.log('🔵 AuthContext: Resposta do sync:', response.ok, data);

          if (response.ok && data.user) {
            setUser(normalizeUser(data.user));
          } else {
            console.error('Sync failed:', data.error);
            // Fallback: use Firebase data temporarily
            setUser(normalizeUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              version: DEFAULT_VERSION,
              type: 'professional'
            }));
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          setUser(normalizeUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            version: DEFAULT_VERSION,
            type: 'professional'
          }));
        }
      } else {
        console.log('🔵 AuthContext: Sem usuário Firebase');
        setUser(null);
      }
      console.log('🔵 AuthContext: Setando loading=false');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Track login activity
      if (result.user) {
        try {
          await trackActivity({
            userId: result.user.uid,
            activityType: 'LOGIN',
            metadata: { email: result.user.email },
          });
        } catch (err) {
          console.error('Failed to track login activity:', err);
        }
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const registerUser = async (email, password, userData = {}) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user in Supabase
      const newUser = {
        id: result.user.uid,
        email: result.user.email,
        ...userData,
        version: userData.version || DEFAULT_VERSION,
        type: userData.type || 'professional'
      };

      await supabase
        .from('users')
        .insert([newUser]);

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Track logout before signing out
      if (user?.id) {
        try {
          await trackActivity({
            userId: user.id,
            activityType: 'LOGOUT',
          });
        } catch (err) {
          console.error('Failed to track logout activity:', err);
        }
      }

      await signOut(auth);
      setUser(null);
      // Clear any localStorage data
      localStorage.removeItem("user");
      localStorage.removeItem("kalon_user");
      localStorage.removeItem("token");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (!error) {
        const updatedUser = normalizeUser({ ...user, ...updates });
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    try {
      // Force reload user data from Supabase
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          name: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL
        })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(normalizeUser(data.user));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logout,
        updateProfile,
        refreshUser,
        userType: user?.type || "professional"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
