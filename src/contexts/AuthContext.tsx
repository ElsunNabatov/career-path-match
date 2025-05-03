import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Profile, UserSubscription } from '@/types/supabase';
import { loadSampleData } from "@/lib/supabase";

interface AuthContextType {
  user: any;
  profile: Profile | null;
  subscription: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Profile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);
    const [subscription, setSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    session()

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  useEffect(() => {
    const getProfile = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          }

          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

        const getSubscription = async () => {
            if (user) {
                try {
                    const { data: subscriptionData, error: subscriptionError } = await supabase
                        .from('subscriptions')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();

                    if (subscriptionError) {
                        console.error('Error fetching subscription:', subscriptionError);
                        setSubscription(null);
                    } else if (subscriptionData) {
                        // Check if the subscription is still valid
                        const expiryDate = new Date(subscriptionData.expires_at);
                        if (expiryDate > new Date()) {
                            setSubscription(subscriptionData.plan);
                        } else {
                            setSubscription('free'); // Set to 'free' if expired
                        }
                    } else {
                        setSubscription('free'); // Default to 'free' if no subscription found
                    }
                } catch (error) {
                    console.error('Error processing subscription:', error);
                    setSubscription(null);
                }
            } else {
                setSubscription(null);
            }
        };

    getProfile();
        getSubscription();
  }, [user]);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        console.error('Login failed:', error);
        throw error;
      }
      console.log('Login successful:', data);
      // No navigation here; let the auth state change trigger the navigation
    } catch (error: any) {
      console.error('Login failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Profile) => {
    setIsLoading(true);
    try {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Failed to update profile:', error);
          throw error;
        }

        setProfile(data);
      }
    } catch (error: any) {
      console.error('Profile update failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    subscription,
    isLoading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
