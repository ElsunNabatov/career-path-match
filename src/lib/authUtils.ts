
// Enhanced auth utilities with better error handling and cleanup
export const cleanupAuthState = () => {
  try {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth state cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

// Enhanced error messages for better UX
export const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message || error.error_description || error.toString();
  
  // Common Supabase auth error mappings
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  
  if (message.includes('signup disabled')) {
    return 'New account registration is currently disabled.';
  }
  
  if (message.includes('Invalid provider')) {
    return 'OAuth provider is not properly configured. Please try email login.';
  }
  
  if (message.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Return original message if no mapping found
  return message;
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters' };
  }
  
  return { isValid: true };
};

// Session validation
export const isValidSession = (session: any): boolean => {
  if (!session || !session.user || !session.access_token) {
    return false;
  }
  
  // Check if token is expired
  const expiresAt = session.expires_at;
  if (expiresAt && Date.now() / 1000 > expiresAt) {
    return false;
  }
  
  return true;
};
