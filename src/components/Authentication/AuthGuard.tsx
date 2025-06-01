
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireVerification = true }) => {
  const { user, profile, isLoading, needsLinkedInVerification } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/10">
        <Loader2 className="h-12 w-12 animate-spin text-brand-purple mb-4" />
        <p className="text-lg text-gray-700">Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if verification is required and user needs LinkedIn verification
  if (requireVerification && needsLinkedInVerification) {
    return <Navigate to="/verification" replace />;
  }

  // Check if user needs to complete onboarding
  if (profile && !profile.orientation && !['/onboarding', '/onboarding/personal-info', '/onboarding/preferences'].includes(location.pathname)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
