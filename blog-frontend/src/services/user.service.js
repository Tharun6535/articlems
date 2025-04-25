import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/user/';

class UserService {
  getUserProfile() {
    return axios.get(API_URL + 'profile', { 
      headers: authHeader(),
      withCredentials: true 
    });
  }

  updateProfile(username, email) {
    return axios.post(API_URL + 'update-profile', {
      username,
      email
    }, { 
      headers: authHeader(),
      withCredentials: true 
    });
  }

  // 2FA related methods
  get2FAStatus() {
    return axios.get(API_URL + '2fa-status', { 
      headers: authHeader(),
      withCredentials: true 
    });
  }

  generate2FASecret() {
    return axios.post(API_URL + 'generate-2fa-secret', {}, { 
      headers: authHeader(),
      withCredentials: true 
    });
  }

  verify2FA(secret, code) {
    // Make sure to trim any whitespace from the verification code
    const cleanCode = code.replace(/\s+/g, '');
    
    return axios.post(API_URL + 'verify-2fa', {
      secret,
      code: cleanCode
    }, { 
      headers: authHeader(),
      withCredentials: true 
    });
  }

  disable2FA() {
    return axios.post(API_URL + 'disable-2fa', {}, { 
      headers: authHeader(),
      withCredentials: true 
    });
  }

  // Admin user management
  getAllUsers() {
    return axios.get('http://localhost:8080/api/admin/users', {
      headers: authHeader(),
      withCredentials: true
    });
  }

  updateUser(id, user) {
    return axios.put(`http://localhost:8080/api/admin/users/${id}`, user, {
      headers: authHeader(),
      withCredentials: true
    });
  }

  deleteUser(id) {
    return axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
      headers: authHeader(),
      withCredentials: true
    });
  }

  reactivateUser(id) {
    console.log(`Reactivating user ID: ${id}`);
    return axios.post(`http://localhost:8080/api/admin/users/${id}/reactivate`, {}, {
      headers: authHeader(),
      withCredentials: true
    })
    .then(response => {
      console.log("Reactivation API response:", response.data);
      return response;
    })
    .catch(error => {
      console.error("Reactivation API error:", error);
      throw error;
    });
  }

  // Public user info by username (for forgot password flow)
  getPublicUserByUsername(username) {
    return axios.get(`http://localhost:8080/api/public/user/${encodeURIComponent(username)}`);
  }
}

export default new UserService(); 