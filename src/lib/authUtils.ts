
/**
 * Utility functions for authentication
 */

// Clean up auth state to prevent auth limbo states
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
  
  // Clear any possible cookie values by setting expired cookies
  document.cookie = 'sb-access-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = 'sb-refresh-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// Parse JWT tokens to get useful information
export const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

// Check if a token is expired
export const isTokenExpired = (token: string) => {
  const decodedToken = parseJwt(token);
  if (!decodedToken) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};
