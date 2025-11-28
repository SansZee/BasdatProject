import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../api/auth';
import { getToken, getUser, setToken, setUser, clearAuth } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth data dari localStorage saat app start
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = (userData: User, userToken: string) => {
    setUserState(userData);
    setTokenState(userToken);
    setUser(userData);
    setToken(userToken);
  };

  // Logout function
  const logout = () => {
    setUserState(null);
    setTokenState(null);
    clearAuth();
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook untuk akses auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}