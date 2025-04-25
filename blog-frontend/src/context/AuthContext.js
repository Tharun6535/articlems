import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth.service';
import { maskEmail } from '../utils/formatUtils';

// Create the auth context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUsername, setMfaUsername] = useState('');
  
  useEffect(() => {
    // Load user from localStorage on initial render
    const loadUser = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          console.log('User loaded from localStorage:', currentUser);
          setUser(currentUser);
        } else {
          console.log('No user found in localStorage');
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Login method
  const login = async (username, password, mfaCode = null) => {
    try {
      const response = await AuthService.login(username, password, mfaCode);
      console.log('Login response:', response);
      
      // Check if MFA is required - handle both direct response and response.data structure
      if ((response && response.mfaRequired) || (response && response.data && response.data.mfaRequired)) {
        const mfaResponse = response.mfaRequired ? response : response.data;
        console.log('MFA required for user:', maskEmail(username));
        setMfaRequired(true);
        setMfaUsername(username); // Store username for MFA validation
        return { mfaRequired: true, message: mfaResponse.message || 'MFA verification required' };
      }
      
      // If we have a successful login
      setUser(response);
      setMfaRequired(false);
      setMfaUsername('');
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Validate MFA method
  const validateMfa = async (code, username = null) => {
    try {
      const usernameToUse = username || mfaUsername;
      console.log('Validating MFA for username:', maskEmail(usernameToUse));
      
      if (!usernameToUse) {
        console.error('No username stored for MFA validation');
        throw new Error('No username stored for MFA validation');
      }
      
      const userData = await AuthService.validateMfa(usernameToUse, code);
      console.log('MFA validation response in context:', userData);
      
      // Check if the validation explicitly failed
      if (userData && userData.valid === false) {
        console.log('MFA validation failed with invalid code');
        return { valid: false, message: 'Invalid verification code' };
      }
      
      // If we have a token, it's successful regardless of the valid flag
      if (userData && userData.accessToken) {
        console.log('MFA validation successful, token received');
        setUser(userData);
        setMfaRequired(false);
        setMfaUsername('');
        return { ...userData, valid: true };
      }
      
      // If we reach here, something unexpected happened
      console.error('MFA validation response format unexpected:', userData);
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('MFA validation error:', error);
      throw error;
    }
  };
  
  // Logout method
  const logout = async () => {
    try {
      // Call the service logout which now returns a Promise
      const result = await AuthService.logout();
      
      // Even if server-side logout fails, we still clear user state locally
      setUser(null);
      setMfaRequired(false);
      setMfaUsername('');
      
      return result;
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Clear local state even on error
      setUser(null);
      setMfaRequired(false);
      setMfaUsername('');
      
      throw error; // Re-throw for caller to handle if needed
    }
  };
  
  // Register method
  const register = async (username, email, password) => {
    return AuthService.register(username, email, password);
  };
  
  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.roles.includes(role);
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return hasRole('ROLE_ADMIN');
  };
  
  // Context value
  const value = {
    user,
    loading,
    mfaRequired,
    mfaUsername, // Expose mfaUsername in context
    login,
    validateMfa,
    logout,
    register,
    hasRole,
    isAdmin,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 