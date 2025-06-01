import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserProfile, signInWithGoogle, signInWithLinkedIn } from '@/lib/supabase';
import { Profile } from '@/types/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { cleanupAuthState, getAuthErrorMessage, isValidSession } from '@/lib/authUtils';
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
  const [initializationComplete, setInitializationComplete] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent infinite loading with timeout
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth loading timeout reached, forcing completion");
        setIsLoading(false);
        setInitializationComplete(true);
      }
    }, 5000); // Reduced timeout for better UX
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log("Initializing authentication...");

        // Clean up any existing problematic auth state
        cleanupAuthState();

        // Set up auth state listener FIRST
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;
            
            console.log("Auth state changed:", event, newSession?.user?.email || "No session");
            
            try {
              if (event === 'SIGNED_OUT') {
                console.log("User signed out, clearing states");
                setSession(null);
                setUser(null);
                setProfile(null);
                setNeedsLinkedInVerification(false);
                setIsLoading(false);
                return;
              } 
              
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (!newSession || !isValidSession(newSession)) {
                  console.warn("Invalid session received, signing out");
                  await supabase.auth.signOut();
                  return;
                }
                
                console.log("User signed in or token refreshed");
                setSession(newSession);
                setUser(newSession.user);

                if (newSession?.user) {
                  // Load profile with proper error handling
                  try {
                    const userProfile = await loadUserProfile(newSession.user.id);
                    // For testing: always set verification as false (no verification needed)
                    const needsVerification = false;
                    setNeedsLinkedInVerification(needsVerification);
                    
                    console.log("Profile loaded after auth change:", userProfile);
                    console.log("Needs verification (testing mode - always false):", needsVerification);
                  } catch (error) {
                    console.error("Error loading user profile after auth change:", error);
                  }
                }
                
                setIsLoading(false);
              } 
              
              if (event === 'INITIAL_SESSION') {
                console.log("Initial session event received");
                setIsLoading(false);
              }
            } catch (error) {
              console.error("Error in auth state change handler:", error);
              if (mounted) {
                setIsLoading(false);
              }
            }
          }
        );

        // THEN get current session
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          cleanupAuthState();
          if (mounted) {
            setIsLoading(false);
            setInitializationComplete(true);
          }
          return;
        }

        console.log("Initial session check:", existingSession?.user?.email || "No session");
        
        if (existingSession && isValidSession(existingSession) && mounted) {
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Load user profile
          if (existingSession?.user) {
            try {
              const userProfile = await loadUserProfile(existingSession.user.id);
              // For testing: always set verification as false (no verification needed)
              const needsVerification = false;
              setNeedsLinkedInVerification(needsVerification);
              console.log("Initial profile loaded:", userProfile);
            } catch (profileError) {
              console.error("Error loading initial user profile:", profileError);
            }
          }
        }
        
        if (mounted) {
          setInitializationComplete(true);
          setIsLoading(false);
        }
        
        return () => {
          authSubscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error in auth initialization:", error);
        if (mounted) {
          setInitializationComplete(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Use the processProfileData function when setting profile state
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

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

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
      
      // For testing: automatically set LinkedIn as verified if not already set
      if (!processedProfile.linkedin_verified) {
        console.log("Auto-setting LinkedIn as verified for testing");
        try {
          await supabase
            .from('profiles')
            .update({ 
              linkedin_verified: true,
              linkedin_url: processedProfile.linkedin_url || 'https://linkedin.com/in/test-user'
            })
            .eq('id', userId);
          
          processedProfile.linkedin_verified = true;
          if (!processedProfile.linkedin_url) {
            processedProfile.linkedin_url = 'https://linkedin.com/in/test-user';
          }
        } catch (updateError) {
          console.error("Error auto-setting LinkedIn verification:", updateError);
        }
      }
      
      if (subscriptionData) {
        setSubscription(subscriptionData.plan);
      }
      
      // For testing: never require verification
      const needsVerification = false;
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
      setIsLoading(true);
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
          emailRedirectTo: `${window.location.origin}/verification`,
        },
      });

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        toast.error(friendlyMessage);
        throw new Error(friendlyMessage);
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        toast.success("Account created successfully!");
      }

      return data;
    } catch (error) {
      console.error("Error signing up:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log("Global sign out error (non-critical):", err);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        toast.error(friendlyMessage);
        setIsLoading(false);
        throw new Error(friendlyMessage);
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        toast.success("Signed in successfully!");
      }
      
      return data;
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/verification`,
        }
      });
      
      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        toast.error(friendlyMessage);
        setIsLoading(false);
        throw new Error(friendlyMessage);
      }
      
      console.log("Google sign-in initiated:", data);
      return data;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const handleSignInWithLinkedIn = async () => {
    try {
      setIsLoading(true);
      cleanupAuthState();
      
      const result = await signInWithLinkedIn();
      console.log("LinkedIn sign-in initiated:", result);
      return result;
    } catch (error) {
      console.error("Error signing in with LinkedIn:", error);
      const friendlyMessage = getAuthErrorMessage(error);
      toast.error(friendlyMessage);
      setIsLoading(false);
      throw new Error(friendlyMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        throw new Error(friendlyMessage);
      }
      
      return data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      cleanupAuthState();
      
      await supabase.auth.signOut({ scope: 'global' });
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Navigate to sign-in instead of forcing page reload
      navigate('/signin', { replace: true });
      setIsLoading(false);
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
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

  const refreshUser = async (): Promise<void> => {
    if (user) {
      try {
        console.log("Refreshing user profile data");
        const refreshedProfile = await loadUserProfile(user.id);
        if (refreshedProfile) {
          console.log("User profile refreshed successfully:", refreshedProfile);
          setProfile(refreshedProfile);
          
          // For testing: never require verification
          const needsVerification = false;
          setNeedsLinkedInVerification(needsVerification);
        }
      } catch (error) {
        console.error("Error refreshing user profile:", error);
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
    isLoading: isLoading && !initializationComplete,
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
