import Cookies from 'js-cookie';
import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const auth = {
  // Login function
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.login(email, password);
      const { access_token, token_type, user } = response.data;
      
      // Store token and user data in cookies
      Cookies.set('token', access_token, { expires: 1 }); // 1 day
      Cookies.set('user', JSON.stringify(user), { expires: 1 });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  // Register function
  register: async (email: string, password: string): Promise<any> => {
    try {
      const response = await apiClient.register(email, password);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  // Logout function
  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    window.location.href = '/login';
  },

  // Get current user from cookies
  getCurrentUser: (): User | null => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        return JSON.parse(userCookie);
      } catch (error) {
        console.error('Error parsing user cookie:', error);
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = Cookies.get('token');
    return !!token;
  },

  // Get token
  getToken: (): string | null => {
    return Cookies.get('token') || null;
  },

  // Verify token with backend
  verifyToken: async (): Promise<User | null> => {
    try {
      if (!auth.isAuthenticated()) {
        return null;
      }
      
      const response = await apiClient.getProfile();
      const user = response.data;
      
      // Update user cookie with fresh data
      Cookies.set('user', JSON.stringify(user), { expires: 1 });
      
      return user;
    } catch (error) {
      console.error('Token verification failed:', error);
      auth.logout();
      return null;
    }
  },
};

export default auth;