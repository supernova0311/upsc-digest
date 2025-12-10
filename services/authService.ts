import { AuthState, User } from '../types';

const API_URL = 'http://localhost:5000/api/auth';
const TOKEN_KEY = 'upsc_auth_token';
const USER_KEY = 'upsc_auth_user';

export const authService = {
  getStoredAuth(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      token,
      user,
      isAuthenticated: !!token && !!user
    };
  },

  async login(email: string, password: string): Promise<AuthState> {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        return { token: data.token, user: data.user, isAuthenticated: true };
    } catch (error: any) {
        // For demo purposes, allow a fake login if backend is down
        if (error.message.includes('Failed to fetch')) {
             console.warn("Backend unavailable, using mock login");
             const mockUser = { _id: 'mock-id', name: 'Demo User', email };
             localStorage.setItem(TOKEN_KEY, 'mock-token');
             localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
             return { token: 'mock-token', user: mockUser, isAuthenticated: true };
        }
        throw error;
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthState> {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    return { token: data.token, user: data.user, isAuthenticated: true };
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '#/login';
  }
};