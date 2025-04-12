
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

const publicRoutes = ['/signin', '/signup', '/verification', '/reset-password'];

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [subscription, setSubscription] = useState<'free' | 'premium' | 'premium_plus' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
      setIsLoading(false);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setIsLoading(false);
    }
  };

  // Helper function to handle post-auth actions
  const handleUserAuthenticated = async (session: any) => {
    if (!session?.user) return;
    
    console.log("User authenticated, session:", session);
    setUser(session.user);
    
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
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        
        console.log("Initial session check:", sessionData?.session ? "Session found" : "No session");
        
        if (sessionData && sessionData.session) {
          await handleUserAuthenticated(sessionData.session);
        } else if (!publicRoutes.includes(location.pathname)) {
          console.log("No session, redirecting to /signin from", location.pathname);
          navigate('/signin');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (event === 'SIGNED_IN' && session) {
        await handleUserAuthenticated(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSubscription(null);
        navigate('/signin');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log("Token refreshed successfully");
        await handleUserAuthenticated(session);
      } else if (event === 'USER_UPDATED' && session) {
        console.log("User updated successfully");
        await handleUserAuthenticated(session);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
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
      
      // Use the specific Supabase callback URL format
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
