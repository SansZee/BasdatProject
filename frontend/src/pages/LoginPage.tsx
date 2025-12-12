import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, LoginRequest } from '../api/auth';
import logo from '../components/shared/LOGO.png';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = (): string | null => {
    if (!formData.username.trim()) {
      return 'Username is required';
    }
    if (!formData.password) {
      return 'Password is required';
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
      // Call API login
      const response = await authAPI.login(formData);
      
      // Save user data to context & localStorage
      // Token sudah di-set sebagai httpOnly cookie oleh backend
      login(response);
      
      // Redirect based on role
      const role = response.role_name;
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
    <div className="h-screen bg-primary flex items-center justify-center px-4 overflow-hidden">
      {/* Home Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 px-3 py-1 text-sm text-accent hover:text-accent/80 border border-accent/30 rounded hover:border-accent transition-colors"
      >
        ← Home
      </Link>

      <div className="w-full max-w-md max-h-screen overflow-y-auto">
        {/* Logo */}
        <div className="text-center mb-4">
          <img src={logo} alt="FilmKing" className="h-10 w-auto mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-accent">Sign In</h1>
          <p className="text-gray-400 text-xs">Access your account</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-light mb-1 font-semibold text-sm">
                Username
              </label>
              <input
                type="text"
                className="input-field py-2"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-light mb-1 font-semibold text-sm">
                Password
              </label>
              <input
                type="password"
                className="input-field py-2"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary w-full py-2 text-sm"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Register Link */}
            <p className="text-center text-gray-400 text-xs">
              No account?{' '}
              <Link to="/register" className="text-accent hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-2 p-2 bg-secondary/50 rounded-lg border border-accent/20">
          <p className="text-xs text-gray-400 font-semibold uppercase">Demo</p>
          <div className="space-y-0.5 text-xs mt-1">
            <div><span className="text-gray-400">Native:</span> <span className="text-accent">native_demo</span></div>
            <div><span className="text-gray-400">Exec:</span> <span className="text-accent">exec_demo</span></div>
            <div><span className="text-gray-400">Prod:</span> <span className="text-accent">prod_demo</span></div>
            <div className="text-gray-400">Pass: Demo123!</div>
          </div>
        </div>
      </div>
    </div>
  );
}