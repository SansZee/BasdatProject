import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, LoginRequest } from '../api/auth';
import { Film } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call API login
      const response = await authAPI.login(formData);
      
      // Save to context & localStorage
      login(response.data.user, response.data.token);
      
      // Redirect based on role
      const role = response.data.user.role_name;
      if (role === 'executive') {
        navigate('/executive/dashboard');
      } else if (role === 'production') {
        navigate('/production/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-accent p-3 rounded-lg">
              <Film className="text-primary" size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-accent mb-2">Film Dashboard</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-light mb-2 font-semibold">
                Username
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-light mb-2 font-semibold">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Register Link */}
            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 card border-accent/50">
          <p className="text-sm text-gray-400 mb-3 font-semibold">Demo Accounts:</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Native User:</span>
              <span className="text-accent">native_demo / Demo123!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Executive:</span>
              <span className="text-accent">exec_demo / Demo123!</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Production:</span>
              <span className="text-accent">prod_demo / Demo123!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}