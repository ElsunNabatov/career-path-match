import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';  // Note that we're now importing from the re-exporter
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
  const [initializationComplete, setInitializationComplete] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timeout reached, forcing state to not loading");
        setIsLoading(false);
        setInitializationComplete(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);

      try {
        console.log("Starting authentication setup...");

        // Clean up any existing auth state to prevent conflicts
        cleanupAuthState();

        // First check for existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", existingSession?.user?.email || "No session");
        
        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Load user profile if we have a session
          if (existingSession?.user) {
            try {
              const userProfile = await loadUserProfile(existingSession.user.id);
              console.log("Initial profile loaded:", userProfile);
              
              // Set verification flag based on profile
              const needsVerification = !userProfile?.linkedin_verified;
              setNeedsLinkedInVerification(needsVerification);
              console.log("Needs LinkedIn verification:", needsVerification);
            } catch (profileError) {
              console.error("Error loading initial user profile:", profileError);
            }
          }
        }
        
        // THEN set up auth state listener
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, newSession?.user?.email || "No session");
            
            if (event === 'SIGNED_OUT') {
              console.log("User signed out, clearing states");
              setSession(null);
              setUser(null);
              setProfile(null);
              setNeedsLinkedInVerification(false);
              
              // Only navigate away if we're not already on a sign-in or sign-up page
              if (!['/signin', '/signup'].includes(location.pathname)) {
                navigate('/signin');
              }
              return;
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              console.log("User signed in or token refreshed");
              setSession(newSession);
              setUser(newSession?.user || null);

              if (newSession?.user) {
                // Use setTimeout to prevent deadlocks with Supabase auth
                setTimeout(async () => {
                  try {
                    const userProfile = await loadUserProfile(newSession.user.id);
                    
                    // First, check if we need verification
                    const needsVerification = !userProfile?.linkedin_verified;
                    setNeedsLinkedInVerification(needsVerification);
                    
                    console.log("Loaded profile after auth change:", userProfile);
                    console.log("Needs verification:", needsVerification);
                    console.log("Current location path:", location.pathname);
                    
                    // Handle redirection based on current path and verification status
                    // Only redirect if we're on auth pages or root
                    if (['/signin', '/signup', '/', '/verification'].includes(location.pathname)) {
                      if (needsVerification) {
                        console.log("Redirecting to verification page");
                        navigate('/verification');
                      } else if (!userProfile || !userProfile.orientation) {
                        console.log("Redirecting to onboarding page");
                        navigate('/onboarding');
                      } else {
                        console.log("Redirecting to people page");
                        navigate('/people');
                      }
                    }
                  } catch (error) {
                    console.error("Error loading user profile after auth change:", error);
                  } finally {
                    setIsLoading(false);
                  }
                }, 100); // Small delay to ensure DOM is ready
              } else {
                setIsLoading(false);
              }
            } else if (event === 'INITIAL_SESSION') {
              // Just update loading state for initial session
              console.log("Initial session event received");
              if (!newSession) {
                // No user is logged in
                setIsLoading(false);
              }
            }
          }
        );
        
        setInitializationComplete(true);
        
        // If we got here and still loading, turn it off
        if (isLoading && !existingSession) {
          setIsLoading(false);
        }
        
        return () => {
          authSubscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error in auth setup:", error);
        setInitializationComplete(true);
        setIsLoading(false);
      }
    };

    loadSession();
  }, [navigate, location.pathname]);

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
      const needsVerification = !processedProfile?.linkedin_verified;
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
      setIsLoading(true);
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Attempt global sign out to prevent conflicts
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log("Global sign out error (non-critical):", err);
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        throw error;
      }

      if (data.user) {
        const userProfile = await loadUserProfile(data.user.id);
        const needsVerification = !userProfile?.linkedin_verified;
        
        toast.success("Signed in successfully!");
        
        if (needsVerification) {
          navigate('/verification');
        } else if (!userProfile || Object.keys(userProfile).length === 0) {
          navigate('/onboarding');
        } else {
          navigate('/people');
        }
      }
      
      setIsLoading(false);
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
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Use the helper function from supabase.ts
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/verification',
        }
      });
      
      console.log("Google sign-in initiated:", data);
      // OAuth redirect will happen automatically
      return data;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
      throw error;
    }
  };

  const handleSignInWithLinkedIn = async () => {
    try {
      setIsLoading(true);
      // Clean up existing auth state first
      cleanupAuthState();
      
      // Use the helper function from supabase.ts
      const result = await signInWithLinkedIn();
      console.log("LinkedIn sign-in initiated:", result);
      // OAuth redirect will happen automatically
      return result;
    } catch (error) {
      console.error("Error signing in with LinkedIn:", error);
      toast.error("Failed to sign in with LinkedIn. Please try again.");
      setIsLoading(false);
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
      setIsLoading(true);
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
          
          // Update verification status
          const needsVerification = !refreshedProfile.linkedin_verified;
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
