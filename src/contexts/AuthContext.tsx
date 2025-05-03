
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/supabase';
import { generateSampleData } from '@/lib/dataSeed';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  subscription: string;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: Error | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  subscription: 'free',
  signIn: async () => ({ user: null, error: null }),
  signUp: async () => ({ user: null, error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithLinkedIn: async () => {},
  resetPassword: async () => ({ data: null, error: null }),
  updateProfile: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<string>('free');

  // Function to refresh user information
  const refreshUser = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        if (profileData) {
          // Convert the hobbies field if it's not already an array
          const processedProfile: Profile = {
            ...profileData,
            hobbies: Array.isArray(profileData.hobbies) ? profileData.hobbies : 
                     (profileData.hobbies ? [profileData.hobbies.toString()] : [])
          };
          
          setProfile(processedProfile);
          setSubscription(processedProfile.subscription || 'free');
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          // Convert the hobbies field if it's not already an array
          const processedProfile: Profile = {
            ...profileData,
            hobbies: Array.isArray(profileData.hobbies) ? profileData.hobbies : 
                     (profileData.hobbies ? [profileData.hobbies.toString()] : [])
          };
          
          setProfile(processedProfile);
          setSubscription(processedProfile.subscription || 'free');
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          // Convert the hobbies field if it's not already an array
          const processedProfile: Profile = {
            ...profileData,
            hobbies: Array.isArray(profileData.hobbies) ? profileData.hobbies : 
                     (profileData.hobbies ? [profileData.hobbies.toString()] : [])
          };
          
          setProfile(processedProfile);
          setSubscription(processedProfile.subscription || 'free');
        }
      } else {
        setProfile(null);
        setSubscription('free');
      }
    });
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, error: error as Error };
    }
  };

  // Sign up with email/password
  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.full_name || "",
          },
        },
      });
      
      if (error) {
        throw error;
      }

      // Generate sample data for the new user (matches, messages, etc.)
      if (data.user) {
        try {
          await generateSampleData(data.user.id);
        } catch (sampleError) {
          console.error('Error generating sample data:', sampleError);
        }
      }
      
      toast.success("Sign up successful! Please check your email to confirm your account.");
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { user: null, error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSubscription('free');
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  // Sign in with LinkedIn
  const signInWithLinkedIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with LinkedIn:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      return { data, error };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { data: null, error: error as Error };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => {
        if (!prev) return null;
        const updatedProfile = { ...prev, ...updates };
        
        // If subscription is being updated, update the state
        if (updates.subscription) {
          setSubscription(updates.subscription);
        }
        
        return updatedProfile;
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    subscription,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithLinkedIn,
    resetPassword,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
