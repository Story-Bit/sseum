"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import Toast from '@/components/ui/Toast';

interface AuthContextType {
  db: Firestore | null;
  auth: Auth | null;
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
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
  const [firestoreDb, setFirestoreDb] = useState<Firestore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: number } | null>(null);
  
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app-id';

  useEffect(() => {
    import('@/firebase/config').then((firebaseConfig) => {
      const { auth, db } = firebaseConfig;
      setFirebaseAuth(auth);
      setFirestoreDb(db);

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);
  
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type, id: Date.now() });
  };

  const value = {
    db: firestoreDb,
    auth: firebaseAuth,
    user,
    userId: user ? user.uid : null,
    appId,
    isLoading,
    showToast,
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