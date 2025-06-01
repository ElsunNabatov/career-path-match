
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthRedirect = () => {
  const { user, profile, isLoading, needsLinkedInVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // If no user, redirect to sign-in (unless already there)
    if (!user && !['/signin', '/signup'].includes(location.pathname)) {
      navigate('/signin', { replace: true });
      return;
    }

    // If user exists but on auth pages, redirect appropriately
    if (user && ['/signin', '/signup', '/'].includes(location.pathname)) {
      // For testing: skip LinkedIn verification, go directly to onboarding or people page
      if (!profile?.orientation) {
        navigate('/onboarding', { replace: true });
      } else {
        // Get the intended destination from state or default to people page
        const from = location.state?.from?.pathname || '/people';
        navigate(from, { replace: true });
      }
    }
  }, [user, profile, isLoading, needsLinkedInVerification, location.pathname, navigate]);
};
