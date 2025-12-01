import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../api/auth';
import { getUser, setUser, clearAuth } from '../utils/storage';
import { authAPI } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  // Validate auth saat app start dengan memanggil /api/auth/profile
  useEffect(() => {
    if (hasValidated) return; // Prevent multiple calls

    const validateAuth = async () => {
      try {
        // Try to get profile dari server
        // Jika success, user sudah authenticated
        // Token akan otomatis dikirim dari httpOnly cookie oleh browser
        const profile = await authAPI.getProfile();
        setUserState(profile);
        
        // Save user data ke localStorage (tapi bukan token!)
        setUser(profile);
      } catch (error) {
        // Jika error 401, berarti tidak ada valid token
        // Ini normal untuk first-time user yang belum login
        clearAuth();
      } finally {
        setLoading(false);
        setHasValidated(true);
      }
    };

    validateAuth();
  }, [hasValidated]);

  // Login function
  const login = (userData: User) => {
    setUserState(userData);
    setUser(userData);
    // Token sudah di-set sebagai httpOnly cookie oleh backend
    // Tidak perlu disimpan di sini
  };

  // Logout function
  const logout = async () => {
    setUserState(null);
    clearAuth();
    try {
      // Call logout endpoint to clear httpOnly cookie
      await authAPI.logout();
    } catch (error) {
      // Ignore error, proceed to login page anyway
      console.error('Logout error:', error);
    }
    window.location.href = '/login';
  };

  const value = {
    user,
    isAuthenticated: !!user,
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