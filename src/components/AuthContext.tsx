"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '@/firebase/config';
import { Firestore } from 'firebase/firestore';
import Toast from '@/components/ui/Toast'; // [추가]

interface AuthContextType {
  db: Firestore;
  auth: typeof auth;
  user: User | null;
  userId: string | null;
  appId: string;
  isLoading: boolean;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null); // [추가]
  
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app-id';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  // [수정] showToast가 console.log 대신 실제 UI를 제어하도록 변경
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type, id: Date.now() });
  };

  const value = {
    db, auth, user, userId: user ? user.uid : null,
    appId, isLoading, showToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};