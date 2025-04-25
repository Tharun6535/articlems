import axios from 'axios';
import { maskEmail } from '../utils/formatUtils';

// Use absolute URL to match api.js
const API_URL = 'http://localhost:8080/api/auth/';

// Configure axios with credentials
axios.defaults.withCredentials = true;

// Store username temporarily for MFA flow
let pendingMfaUsername = '';

class AuthService {
  login(username, password, mfaCode = null) {
    console.log('Attempting login with:', maskEmail(username), mfaCode ? 'and MFA code' : 'without MFA code');
    return axios
      .post(API_URL + 'login', {
        username,
        password,
        mfaCode
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log('Login response:', response);
        
        // If MFA is required but not provided
        if (response.data && response.data.mfaRequired && !mfaCode) {
          // Store username for MFA validation
          pendingMfaUsername = username;
          console.log('Stored pending MFA username:', pendingMfaUsername);
          
          return {
            mfaRequired: true,
            username: response.data.username || username,
            message: response.data.message || 'MFA verification required'
          };
        }
        
        // If login is successful and we have a token
        if (response.data && response.data.success && response.data.token) {
          // Store user info with token in localStorage
          const userData = {
            accessToken: response.data.token,
            username: response.data.username,
            roles: response.data.roles || []
          };
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        }
        
        return response.data;
      })
      .catch(error => {
        console.error('Login error:', error);
        throw error;
      });
  }

  validateMfa(username, code) {
    // Use stored username as fallback
    const effectiveUsername = username || pendingMfaUsername;
    
    if (!effectiveUsername) {
      console.error('No username provided for MFA validation and no pending username stored');
      return Promise.reject(new Error('No username available for MFA validation'));
    }
    
    // Clean the code, removing any spaces or dashes that the user might have added
    const formattedCode = code.replace(/\D/g, '');
    
    console.log(`Sending MFA validation for user: ${maskEmail(effectiveUsername)}, code length: ${formattedCode.length}`);
    
    // Call the MFA validation endpoint
    const requestBody = { username: effectiveUsername, code: formattedCode };
    console.log('MFA validation request:', { 
      username: maskEmail(effectiveUsername), 
      code: formattedCode ? '******' : 'empty' 
    });
    
    return axios
      .post('http://localhost:8080/api/mfa/validate', requestBody, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          // Don't include Authorization header for this endpoint
          // as it's configured to be publicly accessible
        }
      })
      .then(response => {
        console.log('MFA validation response:', response);
        console.log('MFA validation data:', response.data);
        
        // If validation is successful and we got a token
        // The server returns {valid: true, token: "...", roles: [...]}
        if (response.data && response.data.token) {
          console.log('MFA validation successful, token received');
          
          // Store user info with token
          const userData = {
            accessToken: response.data.token,
            username: response.data.username || effectiveUsername,
            roles: response.data.roles || [],
            valid: true // Ensure the valid flag is set
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Clear pending username after successful validation
          pendingMfaUsername = '';
          
          return userData;
        } else if (response.data && response.data.valid === false) {
          console.log('MFA validation failed: Invalid code');
          return { valid: false, message: 'Invalid verification code' };
        } else {
          console.log('MFA validation response format unexpected:', response.data);
          return { 
            ...response.data,
            valid: !!response.data.token // Set valid based on token presence
          };
        }
      })
      .catch(error => {
        console.error('MFA validation error details:', 
          error.response?.data || error.message);
        console.error('Full error object:', error);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        throw error;
      });
  }

  logout() {
    const user = this.getCurrentUser();
    
    // If user is logged in, call backend logout endpoint
    if (user && user.accessToken) {
      console.log('Logging out on server...');
      return axios.post(API_URL + 'logout', {}, {
        headers: {
          'Authorization': 'Bearer ' + user.accessToken
        },
        withCredentials: true
      })
      .then(() => {
        console.log('Logout successful on server');
        localStorage.removeItem('user');
        pendingMfaUsername = '';
        return { success: true };
      })
      .catch(error => {
        console.error('Error during logout:', error);
        // Even if server logout fails, clear local data
        localStorage.removeItem('user');
        pendingMfaUsername = '';
        return { success: false, error: error.message };
      });
    } else {
      // No user to logout, just clear local data
      localStorage.removeItem('user');
      pendingMfaUsername = '';
      return Promise.resolve({ success: true });
    }
  }

  register(username, email, password) {
    return axios.post(API_URL + 'signup', {
      username,
      email,
      password
    }, {
      withCredentials: true
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  isLoggedIn() {
    const user = this.getCurrentUser();
    return !!user;
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.roles.includes(role);
  }

  isAdmin() {
    return this.hasRole('ROLE_ADMIN');
  }

  resetPasswordWithMfa(username, mfaCode, newPassword) {
    return axios.post(API_URL + 'reset-password-mfa', { username, mfaCode, newPassword });
  }
}

export default new AuthService(); 