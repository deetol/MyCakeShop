/**
 * Authentication Storage Helper for MyCakeShop Frontend
 * 
 * This module provides utilities for managing authentication tokens and user data
 * in localStorage with SSR safety checks.
 */

const TOKEN_KEY = 'mycakeshop_token';
const USER_KEY = 'mycakeshop_user';

/**
 * Check if we're running in the browser
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Authentication storage utilities
 */
export const authStorage = {
  /**
   * Get authentication token
   */
  getToken: (): string | null => {
    if (!isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Save authentication token
   */
  setToken: (token: string): void => {
    if (!isBrowser) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove authentication token
   */
  removeToken: (): void => {
    if (!isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
  },

  /**
   * Get user data
   */
  getUser: (): any | null => {
    if (!isBrowser) return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Save user data
   */
  setUser: (user: any): void => {
    if (!isBrowser) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Remove user data
   */
  removeUser: (): void => {
    if (!isBrowser) return;
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authStorage.getToken();
  },

  /**
   * Check if user is admin
   */
  isAdmin: (): boolean => {
    const user = authStorage.getUser();
    return user?.role === 'admin';
  },

  /**
   * Clear all authentication data
   */
  clearAll: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },
};

/**
 * Get authorization header with token
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Type definitions
 */
export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
