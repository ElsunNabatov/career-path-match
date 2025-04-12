
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextProps {
  user: any | null;
  profile: any | null;
  subscription: 'free' | 'premium' | 'premium_plus' | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define public routes that don't require authentication
const publicRoutes = ['/signin', '/signup', '/verification', '/reset-password'];

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<'free' | 'premium' | 'premium_plus' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [authInitialized, setAuthInitialized] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        setSubscription('free');
        return 'free';
      }
      
      setSubscription(data?.plan as 'free' | 'premium' | 'premium_plus' || 'free');
      return data?.plan || 'free';
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription('free');
      return 'free';
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        console.log("Refreshed user data:", data.user);
        setUser(data.user);
        await fetchUserProfile(data.user.id);
        await fetchUserSubscription(data.user.id);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle post-auth actions
  const handleUserAuthenticated = (session: any) => {
    if (!session?.user) return;
    
    console.log("User authenticated, session:", session);
    setUser(session.user);
    
    // Use setTimeout to prevent OAuth deadlocks
    setTimeout(async () => {
      try {
        await fetchUserProfile(session.user.id);
        await fetchUserSubscription(session.user.id);
        
        if (publicRoutes.includes(location.pathname)) {
          console.log("Redirecting to /people from", location.pathname);
          navigate('/people');
        }
      } catch (error) {
        console.error("Error handling authenticated user:", error);
      }
    }, 0);
  };

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // First set up the auth listener before checking the session
        const { data } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session ? "Session exists" : "No session");
          
          if (session) {
            handleUserAuthenticated(session);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setSubscription(null);
            if (!publicRoutes.includes(location.pathname)) {
              navigate('/signin');
            }
          }
        });
        
        authListener = data;
        
        // Then check for an existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session ? "Session found" : "No session");
        
        if (session) {
          handleUserAuthenticated(session);
        } else if (!publicRoutes.includes(location.pathname)) {
          console.log("No session, redirecting to /signin from", location.pathname);
          navigate('/signin');
        }
        
        setAuthInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (!publicRoutes.includes(location.pathname)) {
          navigate('/signin');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Clean up the auth listener when the component unmounts
    return () => {
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Signed in successfully!');
      // Auth listener will handle navigation
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Verification email sent!');
      navigate('/verification');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth flow');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
        throw error;
      }
      
      console.log('Google OAuth initiated, URL:', data?.url);
      // Auth redirect will happen automatically
    } catch (error: any) {
      console.error('Error in Google sign in:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const signInWithLinkedIn = async () => {
    try {
      console.log('Starting LinkedIn OAuth flow');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}`,
          scopes: 'openid profile email',
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        toast.error(error.message || 'Failed to sign in with LinkedIn');
        throw error;
      }
      
      console.log('LinkedIn OAuth initiated, URL:', data?.url);
      // Auth redirect will happen automatically
    } catch (error: any) {
      console.error('Error in LinkedIn sign in:', error);
      toast.error(error.message || 'Failed to sign in with LinkedIn');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSubscription(null);
      navigate('/signin');
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...profileData })
        .select();

      if (error) throw error;
      
      await fetchUserProfile(user.id);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  // Don't render children until auth is initialized
  if (isLoading && !authInitialized && !publicRoutes.includes(location.pathname)) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const value = {
    user,
    profile,
    subscription,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithLinkedIn,
    resetPassword,
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
