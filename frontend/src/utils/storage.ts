// Storage keys
const USER_KEY = 'user';

// User management (hanya simpan user data, bukan token)
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
// Token dihapus otomatis dari httpOnly cookie oleh server
export const clearAuth = (): void => {
  removeUser();
};
