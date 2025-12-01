import axiosInstance from '../utils/axios';

// Type definitions
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// API calls
export const authAPI = {
  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data.data;
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data.data;
  },

  // Get profile
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout', {});
  },
};