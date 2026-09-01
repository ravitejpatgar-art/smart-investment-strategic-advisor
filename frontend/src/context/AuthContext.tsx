import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type FirebaseUser, 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutFirebase, 
  resetPassword as sendFirebasePasswordReset,
  subscribeToAuthState,
  isAuthEnabled
} from '../services/firebase';

export interface AuthContextType {
  currentUser: FirebaseUser | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  signUp: (email: string, password: string, name: string) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authEnabled = isAuthEnabled();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(authEnabled);

  useEffect(() => {
    if (!authEnabled) {
      setIsAuthLoading(false);
      return;
    }

    const unsubscribe = subscribeToAuthState((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [authEnabled]);

  const signUp = async (email: string, password: string, name: string): Promise<FirebaseUser> => {
    return await registerWithEmail(email, password, name);
  };

  const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    return await loginWithEmail(email, password);
  };

  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    return await loginWithGoogle();
  };

  const signOut = async (): Promise<void> => {
    if (authEnabled) {
      await logoutFirebase();
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendFirebasePasswordReset(email);
  };

  const value: AuthContextType = {
    currentUser,
    isAuthLoading,
    isAuthenticated: !authEnabled || !!currentUser,
    isGuestMode: !authEnabled,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
