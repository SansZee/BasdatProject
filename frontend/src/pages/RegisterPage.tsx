import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, RegisterRequest } from '../api/auth';
import { Film } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): string | null => {
    // Username validation
    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    
    // Password strength check (at least 1 uppercase, 1 lowercase, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      return 'Password must contain at least 1 uppercase, 1 lowercase, and 1 number';
    }

    // Full name validation
    if (formData.full_name.trim().length < 3) {
      return 'Full name must be at least 3 characters';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form first
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Call API register
      const response = await authAPI.register(formData);
      
      // Auto login setelah register (response already unwrapped by axios)
      login(response.user, response.token);
      
      // Redirect ke home
      navigate('/');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-accent p-3 rounded-lg">
              <Film className="text-primary" size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-accent mb-2">Create Account</h1>
          <p className="text-gray-400">Join Film Dashboard today</p>
        </div>

        {/* Register Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-light mb-2 font-semibold text-sm">
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-light mb-2 font-semibold text-sm">
                Username
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
                minLength={3}
              />
              <p className="text-gray-400 text-xs mt-1">At least 3 characters</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-light mb-2 font-semibold text-sm">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-light mb-2 font-semibold text-sm">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-gray-400 text-xs mt-1">At least 8 characters</p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}