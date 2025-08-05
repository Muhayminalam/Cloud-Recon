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
      
      // Store token and user data in cookies with longer expiration
      Cookies.set('token', access_token, { expires: 7, secure: true, sameSite: 'strict' }); // 7 days
      Cookies.set('user', JSON.stringify(user), { expires: 7, secure: true, sameSite: 'strict' });
      
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
    // Clear any other auth-related data
    localStorage.removeItem('lastActivity');
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
    const user = Cookies.get('user');
    return !!(token && user);
  },

  // Get token
  getToken: (): string | null => {
    return Cookies.get('token') || null;
  },

  // Verify token with backend - with better error handling
  verifyToken: async (): Promise<User | null> => {
    try {
      if (!auth.isAuthenticated()) {
        return null;
      }
      
      // Record activity
      localStorage.setItem('lastActivity', Date.now().toString());
      
      const response = await apiClient.getProfile();
      const user = response.data;
      
      // Update user cookie with fresh data
      Cookies.set('user', JSON.stringify(user), { expires: 7, secure: true, sameSite: 'strict' });
      
      return user;
    } catch (error: any) {
      console.error('Token verification failed:', error);
      
      // Only logout if it's a 401 (unauthorized) error
      if (error.response?.status === 401) {
        auth.logout();
      }
      
      // For other errors (network issues, etc.), return cached user if available
      const cachedUser = auth.getCurrentUser();
      if (cachedUser && error.response?.status !== 401) {
        console.warn('Using cached user due to network error');
        return cachedUser;
      }
      
      return null;
    }
  },

  // Check if token needs refresh (optional - for future use)
  shouldRefreshToken: (): boolean => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) return true;
    
    const timeSinceActivity = Date.now() - parseInt(lastActivity);
    const thirtyMinutes = 30 * 60 * 1000;
    
    return timeSinceActivity > thirtyMinutes;
  },

  // Update last activity timestamp
  updateActivity: () => {
    localStorage.setItem('lastActivity', Date.now().toString());
  },

  // Initialize auth state (call this on app startup)
  initializeAuth: async (): Promise<User | null> => {
    if (!auth.isAuthenticated()) {
      return null;
    }

    // Try to get cached user first
    const cachedUser = auth.getCurrentUser();
    
    // Only verify with backend if we should refresh
    if (auth.shouldRefreshToken()) {
      return await auth.verifyToken();
    }
    
    return cachedUser;
  }
};

export default auth;