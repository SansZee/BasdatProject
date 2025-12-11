import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from './LOGO.png';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    // Navigate to home without any search state
    navigate('/', { replace: true, state: {} });
  };

  return (
    <nav className="bg-transparent">
      <div className="max-w-[1600px] mx-auto px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer bg-none border-none p-0 drop-shadow-lg"
          >
            <img src={logo} alt="FilmKing" className="h-16 w-auto brightness-110" />
          </button>

          {/* Middle - Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/search"
              className="flex items-center gap-2 text-light bg-secondary border-2 border-accent rounded-lg px-4 py-2 hover:bg-secondary/80 hover:text-accent transition-colors drop-shadow-lg font-semibold"
            >
              <Search size={20} />
              <span>Filter Search</span>
            </Link>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg border border-accent/30">
                  <User size={20} className="text-accent" />
                  <div className="text-sm">
                    <p className="text-light font-semibold">{user?.username}</p>
                    <p className="text-gray-400 text-xs capitalize">{user?.role_name.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-semibold">Logout</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>

                {/* Register Button */}
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}