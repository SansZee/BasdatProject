import { Link, useNavigate } from 'react-router-dom';
import { User, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import logo from './LOGO.png';

export function Navigation() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        await logout();
    };

    const handleLogoClick = () => {
        // Navigate to home
        navigate('/', { replace: true });
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="bg-transparent">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button
                        onClick={handleLogoClick}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer bg-none border-none p-0 drop-shadow-lg"
                    >
                        <img src={logo} alt="FilmKing" className="h-12 sm:h-16 w-auto brightness-110" />
                    </button>

                    {/* Desktop - Middle Navigation Links */}
                    <div className="hidden sm:flex items-center gap-6">
                        <Link
                            to="/search"
                            className="flex items-center gap-2 text-light bg-secondary border-2 border-accent rounded-lg px-4 py-2 hover:bg-secondary/80 hover:text-accent transition-colors drop-shadow-lg font-semibold"
                        >
                            <Search size={20} />
                            <span>Filter Search</span>
                        </Link>
                    </div>

                    {/* Desktop - Right Side Auth Buttons */}
                    <div className="hidden sm:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {/* User Info */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg border border-accent/30">
                                    <User size={20} className="text-accent" />
                                    <div className="text-sm">
                                        <p className="text-light font-semibold">{user?.username}</p>
                                        <p className="text-gray-400 text-xs capitalize">{user?.role_name ? user.role_name.replace('_', ' ') : 'user'}</p>
                                    </div>
                                </div>

                                {/* Dashboard Button (conditional based on role) */}
                                {user?.role_name && (user.role_name.toLowerCase() === 'executive' || user.role_name.toLowerCase() === 'production') && (
                                    <button
                                        onClick={() => navigate(`/${user.role_name.toLowerCase()}/dashboard`)}
                                        className="px-4 py-2 bg-accent/10 text-accent rounded-lg border-2 border-accent hover:bg-accent hover:text-primary transition-colors font-semibold text-sm"
                                    >
                                        Dashboard
                                    </button>
                                )}

                                {/* Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Logging out...' : 'Logout'}
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

                    {/* Mobile - Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="sm:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden mt-4 pb-4 space-y-3">
                        <Link
                            to="/search"
                            className="flex items-center gap-2 text-light bg-secondary border-2 border-accent rounded-lg px-4 py-2 hover:bg-secondary/80 transition-colors w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Search size={20} />
                            <span>Filter Search</span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {/* Mobile User Info */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg border border-accent/30">
                                    <User size={20} className="text-accent" />
                                    <div className="text-sm">
                                        <p className="text-light font-semibold">{user?.username}</p>
                                        <p className="text-gray-400 text-xs capitalize">{user?.role_name ? user.role_name.replace('_', ' ') : 'user'}</p>
                                    </div>
                                </div>

                                {/* Mobile Dashboard Button */}
                                {user?.role_name && (user.role_name.toLowerCase() === 'executive' || user.role_name.toLowerCase() === 'production') && (
                                    <button
                                        onClick={() => {
                                            navigate(`/${user.role_name.toLowerCase()}/dashboard`);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-2 bg-accent/10 text-accent rounded-lg border-2 border-accent hover:bg-accent hover:text-primary transition-colors font-semibold text-sm"
                                    >
                                        Dashboard
                                    </button>
                                )}

                                {/* Mobile Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 bg-red-500/10 text-red-500 rounded-lg border-2 border-red-500 hover:bg-red-500 hover:text-white transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Logging out...' : 'Logout'}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Mobile Login Button */}
                                <Link to="/login" className="btn-secondary block text-center">
                                    Sign In
                                </Link>

                                {/* Mobile Register Button */}
                                <Link to="/register" className="btn-primary block text-center">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}