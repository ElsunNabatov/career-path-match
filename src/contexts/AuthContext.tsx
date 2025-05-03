import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getUserProfile } from '@/lib/supabase';
import { Profile } from '@/types/supabase';

interface AuthContextType {
  session: Session | null;
  user: any | null;
  profile: Profile | null;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      setIsLoading(false);
    };

    loadSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });
  }, []);

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
    };
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
        processedProfile.subscription = subscriptionData.plan;
      }
      
      setProfile(processedProfile);
      return processedProfile;
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      return data;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      return data;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
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

  // Use processProfileData in other places that handle profiles
  const refreshUser = async () => {
    if (user) {
      const refreshedProfile = await loadUserProfile(user.id);
      if (refreshedProfile) {
        setProfile(processedProfile => ({
          ...processedProfile,
          ...refreshedProfile
        }));
      }
    }
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
    isLoading,
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
