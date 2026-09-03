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
import { auditLogger } from '../services/auditLogger';

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
    try {
      const user = await registerWithEmail(email, password, name);
      auditLogger.auth('AUTH_SIGNUP_SUCCESS', 'success');
      return user;
    } catch (err: any) {
      auditLogger.auth('AUTH_SIGNUP_FAILURE', 'error', { errorType: err?.code || 'SIGNUP_ERROR' });
      throw err;
    }
  };

  const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const user = await loginWithEmail(email, password);
      auditLogger.auth('AUTH_LOGIN_SUCCESS', 'success');
      return user;
    } catch (err: any) {
      auditLogger.auth('AUTH_LOGIN_FAILURE', 'error', { errorType: err?.code || 'LOGIN_ERROR' });
      throw err;
    }
  };

  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    try {
      const user = await loginWithGoogle();
      auditLogger.auth('AUTH_LOGIN_SUCCESS', 'success', { provider: 'google' });
      return user;
    } catch (err: any) {
      auditLogger.auth('AUTH_LOGIN_FAILURE', 'error', { provider: 'google', errorType: err?.code || 'GOOGLE_AUTH_ERROR' });
      throw err;
    }
  };

  const signOut = async (): Promise<void> => {
    if (authEnabled) {
      await logoutFirebase();
      auditLogger.auth('AUTH_LOGOUT', 'info');
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
