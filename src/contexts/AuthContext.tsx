
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextProps {
  user: any | null;
  profile: any | null;
  subscription: 'free' | 'premium' | 'premium_plus' | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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

const publicRoutes = ['/signin', '/signup', '/verification'];

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
        // If no active subscription is found, default to free
        setSubscription('free');
        return 'free';
      }
      
      setSubscription(data.plan);
      return data.plan;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription('free');
      return 'free';
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setUser(data.user);
        await fetchUserProfile(data.user.id);
        await fetchUserSubscription(data.user.id);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getUser();
        
        if (data && data.user) {
          setUser(data.user);
          await fetchUserProfile(data.user.id);
          await fetchUserSubscription(data.user.id);
          
          if (publicRoutes.includes(location.pathname)) {
            navigate('/people');
          }
        } else if (!publicRoutes.includes(location.pathname)) {
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
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
        await fetchUserSubscription(session.user.id);
        
        if (publicRoutes.includes(location.pathname)) {
          navigate('/people');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setSubscription(null);
        navigate('/signin');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Signed in successfully!');
      navigate('/people');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
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
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSubscription(null);
      navigate('/signin');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
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
    signOut,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
