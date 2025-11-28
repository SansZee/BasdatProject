// Storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// User management
export const getUser = (): any | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Clear all auth data (logout)
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

// Check authentication
export const isAuthenticated = (): boolean => {
  return !!getToken();
};