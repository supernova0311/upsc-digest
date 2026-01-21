/**
 * AUTHENTICATION SERVICE
 * 
 * This service handles all user authentication operations:
 * - User login (verify email & password)
 * - User registration (create new account)
 * - Token management (JWT stored in localStorage)
 * - Session management (getStoredAuth, logout)
 * 
 * How it works:
 * 1. User logs in → server returns JWT token
 * 2. Token stored in localStorage
 * 3. On page reload → token retrieved from localStorage
 * 4. Token included in API requests (Authorization header)
 * 5. Backend validates token before returning data
 */

// Backend API endpoint for authentication requests
const API_URL = 'http://localhost:5000/api/auth';
// localStorage key for storing JWT token
const TOKEN_KEY = 'upsc_auth_token';
// localStorage key for storing user information
const USER_KEY = 'upsc_auth_user';

export const authService = {
  /**
   * GET STORED AUTH
   * 
   * Retrieves the user's authentication info from localStorage
   * Called every time the app checks if user is logged in
   * 
   * @returns {Object} { token, user, isAuthenticated }
   */
  getStoredAuth() {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem(TOKEN_KEY);
    // Retrieve user data from localStorage (stored as JSON string)
    const userStr = localStorage.getItem(USER_KEY);
    // Parse user JSON string back to object (or null if not found)
    const user = userStr ? JSON.parse(userStr) : null;
    
    return {
      token,
      user,
      // User is authenticated if both token and user data exist
      isAuthenticated: !!token && !!user
    };
  },

  /**
   * LOGIN
   * 
   * Authenticates user with email and password
   * Sends credentials to backend, receives JWT token on success
   * 
   * @param {String} email - User's email address
   * @param {String} password - User's password
   * @returns {Object} { token, user, isAuthenticated }
   */
  async login(email, password) {
    try {
        // Send login request to backend server
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST', // POST request to submit data
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        // Parse server response
        const data = await response.json();
        // If response status indicates error, throw error
        if (!response.ok) throw new Error(data.error || 'Login failed');

        // Save JWT token to localStorage for future requests
        localStorage.setItem(TOKEN_KEY, data.token);
        // Save user info to localStorage
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        // Return authentication info
        return { token: data.token, user: data.user, isAuthenticated: true };
    } catch (error) {
        // If backend is unreachable, use fallback (demo mode)
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

  async register(name, email, password) {
    try {
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
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
           console.warn("Backend unavailable, using mock registration");
           const mockUser = { _id: 'mock-id', name, email };
           localStorage.setItem(TOKEN_KEY, 'mock-token-' + Date.now());
           localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
           return { token: 'mock-token-' + Date.now(), user: mockUser, isAuthenticated: true };
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = '#/login';
  }
};
