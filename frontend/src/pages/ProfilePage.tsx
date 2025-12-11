import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { useAuth } from '../context/AuthContext';
import { watchlistAPI, WatchlistItem } from '../api/watchlist';
import { LogOut, Film, Heart, Calendar, Mail } from 'lucide-react';

export function ProfilePage() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [watchlistLoading, setWatchlistLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Load watchlist
    useEffect(() => {
        if (!user) return;

        const fetchWatchlist = async () => {
            try {
                setError(null);
                const data = await watchlistAPI.getMyWatchlist();
                setWatchlist(data);
            } catch (err) {
                console.error('Failed to fetch watchlist:', err);
                setError('Failed to load watchlist');
            } finally {
                setWatchlistLoading(false);
            }
        };

        fetchWatchlist();
    }, [user]);

    // Handle remove from watchlist
    const handleRemoveFromWatchlist = async (titleId: string) => {
        try {
            await watchlistAPI.removeFromWatchlist(titleId);
            setWatchlist(watchlist.filter(item => item.title_id !== titleId));
        } catch (err) {
            console.error('Failed to remove from watchlist:', err);
            setError('Failed to remove item from watchlist');
        }
    };

    // Handle logout
    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-primary">
                <Navigation />
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-400 text-lg">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-primary">
            <Navigation />

            {/* Profile Header */}
            <div className="bg-gradient-to-b from-secondary to-primary py-12">
                <div className="max-w-[1600px] mx-auto px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Profile Info */}
                        <div className="md:col-span-2">
                            <h1 className="text-light text-4xl font-bold mb-6">
                                {user.full_name}
                            </h1>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-accent" size={20} />
                                    <div>
                                        <p className="text-gray-400 text-sm">Email</p>
                                        <p className="text-light font-semibold">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Film className="text-accent" size={20} />
                                    <div>
                                        <p className="text-gray-400 text-sm">Username</p>
                                        <p className="text-light font-semibold">{user.username}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Heart className="text-accent" size={20} />
                                    <div>
                                        <p className="text-gray-400 text-sm">Role</p>
                                        <p className="text-light font-semibold capitalize">
                                            {user.role_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="text-accent" size={20} />
                                    <div>
                                        <p className="text-gray-400 text-sm">Member Since</p>
                                        <p className="text-light font-semibold">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="mt-8 flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Status Card */}
                        <div className="bg-secondary border-2 border-accent/30 rounded-lg p-6 h-fit">
                            <h3 className="text-light text-lg font-bold mb-6">
                                Account Status
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">Active</p>
                                    <span className="inline-block px-3 py-1 bg-green-600/20 border border-green-600 text-green-400 rounded text-sm font-semibold">
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-gray-400 text-sm mb-2">
                                        Watchlist Items
                                    </p>
                                    <p className="text-light text-2xl font-bold">
                                        {watchlist.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Watchlist Section */}
            <div className="py-16">
                <div className="max-w-[1600px] mx-auto px-8">
                    <h2 className="text-light text-3xl font-bold mb-8">
                        My Watchlist
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 border-2 border-red-500 text-red-500 px-6 py-4 rounded-lg mb-8">
                            {error}
                        </div>
                    )}

                    {watchlistLoading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Loading watchlist...</p>
                        </div>
                    ) : watchlist.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                            {watchlist.map((item) => (
                                <div
                                    key={item.watchlist_id}
                                    className="group relative"
                                >
                                    <div
                                        onClick={() => navigate(`/titles/${item.title_id}`)}
                                        className="card hover:border-accent transition-colors cursor-pointer"
                                    >
                                        <div className="aspect-[2/3] bg-secondary/50 rounded-lg mb-3 flex items-center justify-center group-hover:bg-secondary transition-colors">
                                            <Film className="text-accent" size={48} />
                                        </div>
                                        <h4 className="text-light font-semibold mb-2 line-clamp-2 text-sm h-10">
                                            {item.title_name || 'Unknown Title'}
                                        </h4>
                                        {item.vote_average && (
                                            <div className="flex items-center gap-1 mb-3">
                                                <span className="text-accent font-semibold text-sm">
                                                    ⭐ {item.vote_average.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Remove button on hover */}
                                    <button
                                        onClick={() => handleRemoveFromWatchlist(item.title_id)}
                                        className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove from watchlist"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-secondary/50 rounded-lg">
                            <p className="text-gray-400 text-lg">
                                Your watchlist is empty
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 px-6 py-2 bg-accent text-primary font-semibold rounded hover:bg-accent/90 transition-colors"
                            >
                                Explore Titles
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
