import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser, getUserProfile, signInWithGoogle, signInWithLinkedIn } from '@/lib/supabase';
import { Profile } from '@/types/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { cleanupAuthState } from '@/lib/authUtils';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: any | null;
  profile: Profile | null;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithLinkedIn: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  subscription?: string;
  needsLinkedInVerification: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<string>('free');
  const [needsLinkedInVerification, setNeedsLinkedInVerification] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);

      try {
        // Clean up any existing auth state to prevent conflicts
        cleanupAuthState();

        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            
            if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
              setProfile(null);
              navigate('/signin');
              return;
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              console.log("User signed in or token refreshed");
              setSession(session);
              setUser(session?.user || null);

              if (session?.user) {
                // Use setTimeout to prevent deadlocks with Supabase auth
                setTimeout(() => {
                  loadUserProfile(session.user.id).then(profile => {
                    // Check if user needs verification
                    const needsVerification = !profile?.linkedin_verified || !profile?.selfie_verified;
                    setNeedsLinkedInVerification(needsVerification);
                    
                    // Redirect based on verification status and current location
                    if (location.pathname === '/signin' || location.pathname === '/signup') {
                      if (needsVerification) {
                        console.log("Redirecting to verification page");
                        navigate('/verification');
                      } else {
                        console.log("Redirecting to people page");
                        navigate('/people');
                      }
                    }
                  });
                }, 0);
              }
            }
          }
        );

        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session?.user?.email);
        
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
        
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error in auth setup:", error);
        setIsLoading(false);
      }
    };

    loadSession();
  }, [navigate, location.pathname]);

  const processProfileData = (profileData: any): Profile => {
    // Handle the hobbies field which might come as Json or string[]
    let processedHobbies: string[] = [];
    
    if (profileData.hobbies) {
      if (Array.isArray(profileData.hobbies)) {
        // If it's already an array, convert any non-string elements to strings
        processedHobbies = profileData.hobbies.map((hobby: any) => String(hobby));
      } else if (typeof profileData.hobbies === 'string') {
        // If it's a string (possibly JSON), try to parse it
        try {
          const parsed = JSON.parse(profileData.hobbies);
          if (Array.isArray(parsed)) {
            processedHobbies = parsed.map((h: any) => String(h));
          } else {
            processedHobbies = [String(profileData.hobbies)];
          }
        } catch {
          // If parsing fails, treat it as a single hobby string
          processedHobbies = [profileData.hobbies];
        }
      } else {
        // For any other type, convert to string and make it a single-element array
        processedHobbies = [String(profileData.hobbies)];
      }
    }

    return {
      ...profileData,
      hobbies: processedHobbies
    } as Profile;
  };

  // Use the processProfileData function when setting profile state
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Also get subscription data
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) {
        console.error('Error loading user profile:', error);
        return null;
      }
      
      const processedProfile = processProfileData(profileData);
      
      // Add subscription information to the profile
      if (subscriptionData) {
        setSubscription(subscriptionData.plan);
      }
      
      // Check if user needs LinkedIn verification
      const needsVerification = !processedProfile?.linkedin_verified || !processedProfile?.selfie_verified;
      setNeedsLinkedInVerification(needsVerification);
      
      setProfile(processedProfile);
      return processedProfile;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
          emailRedirectTo: window.location.origin + '/verification',
        },
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        toast.success("Account created successfully!");
      }

      return data;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Attempt global sign out to prevent conflicts
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        toast.success("Signed in successfully!");
      }

      return data;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Use the helper function from supabase.ts
      return await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      throw error;
    }
  };

  const handleSignInWithLinkedIn = async () => {
    try {
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Use the helper function from supabase.ts
      return await signInWithLinkedIn();
    } catch (error) {
      console.error("Error signing in with LinkedIn:", error);
      toast.error("Failed to sign in with LinkedIn. Please try again.");
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      await supabase.auth.signOut({ scope: 'global' });
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Force page reload for a clean state
      window.location.href = '/signin';
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      await loadUserProfile(user.id);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (user) {
      const refreshedProfile = await loadUserProfile(user.id);
      if (refreshedProfile) {
        setProfile(refreshedProfile);
      }
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithLinkedIn: handleSignInWithLinkedIn,
    resetPassword,
    signOut,
    updateProfile,
    refreshUser,
    isLoading,
    subscription,
    needsLinkedInVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
