import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthPage } from './AuthPage';
import { isAuthEnabled } from '../../services/firebase';
import { BrandLogo } from '../common/BrandLogo';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthLoading: contextLoading, isAuthenticated: contextAuth } = useAuth();
  const authEnabled = isAuthEnabled();

  // If Auth is disabled via feature flag (Guest Mode), allow immediate access
  if (!authEnabled) {
    return <>{children}</>;
  }

  // Show loading spinner while Firebase verifies session
  if (contextLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6 text-[var(--color-text-primary)] font-sans">
        <BrandLogo size="xl" variant="stacked" showSubtitle subtitleText="VERIFYING SESSION" />
        <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mt-4" />
        <p className="text-xs text-[var(--color-text-muted)] mt-3 font-mono">Verifying secure authentication...</p>
      </div>
    );
  }

  // If unauthenticated in Firebase, redirect / render Login Page
  if (!contextAuth) {
    return <AuthPage />;
  }

  // If authenticated in Firebase, render protected view
  return <>{children}</>;
};

export default ProtectedRoute;
