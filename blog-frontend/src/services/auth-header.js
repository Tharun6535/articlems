export default function authHeader() {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('No user found in localStorage');
      return {};
    }

    const user = JSON.parse(userStr);
    console.log('Auth header - user object:', user);

    // Check for different token formats
    if (user.accessToken) {
      console.log('Using accessToken for authorization');
      return { Authorization: 'Bearer ' + user.accessToken };
    } else if (user.token) {
      console.log('Using token for authorization');
      return { Authorization: 'Bearer ' + user.token };
    } else if (typeof user === 'string') {
      console.log('User is a string token');
      return { Authorization: 'Bearer ' + user };
    } else {
      console.log('No token found in user object');
      return {};
    }
  } catch (error) {
    console.error('Error in authHeader:', error);
    return {};
  }
} 