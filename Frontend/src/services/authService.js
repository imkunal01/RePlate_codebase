// Authentication service for API calls
const API_URL = 'http://localhost:5000/api/auth';

// Regular login with email and password
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.data));
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get Google Auth URL
export const getGoogleAuthUrl = async () => {
  try {
    const response = await fetch(`${API_URL}/google/url`, {
      method: 'GET',
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, url: data.url };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Handle Google callback with code
export const handleGoogleCallback = async (code) => {
  try {
    const response = await fetch(`${API_URL}/google/callback?code=${code}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.data));
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Logout
export const logout = async () => {
  try {
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};