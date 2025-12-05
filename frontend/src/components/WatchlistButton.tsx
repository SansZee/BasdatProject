import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { watchlistAPI } from '../api/watchlist';

interface WatchlistButtonProps {
    titleId: string;
    className?: string;
}

export function WatchlistButton({ titleId, className = '' }: WatchlistButtonProps) {
    const { user } = useAuth();
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if title is in watchlist
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const checkWatchlist = async () => {
            try {
                setError(null);
                const status = await watchlistAPI.checkWatchlistStatus(titleId);
                setInWatchlist(status.in_watchlist);
            } catch (err) {
                console.error('Failed to check watchlist status:', err);
                setError('Failed to load watchlist status');
            } finally {
                setLoading(false);
            }
        };

        checkWatchlist();
    }, [titleId, user]);

    // Handle toggle watchlist
    const handleToggleWatchlist = async () => {
        if (!user) {
            setError('Please login to add to watchlist');
            return;
        }

        setLoading(true);
        try {
            setError(null);

            if (inWatchlist) {
                await watchlistAPI.removeFromWatchlist(titleId);
                setInWatchlist(false);
            } else {
                await watchlistAPI.addToWatchlist(titleId);
                setInWatchlist(true);
            }
        } catch (err) {
            console.error('Failed to toggle watchlist:', err);
            setError('Failed to update watchlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleToggleWatchlist}
                disabled={loading || !user}
                className={`flex items-center gap-2 px-6 py-3 ${inWatchlist
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-accent hover:bg-accent/90'
                    } disabled:opacity-50 disabled:cursor-not-allowed text-primary font-semibold rounded-lg transition-colors ${className}`}
            >
                <Heart
                    size={20}
                    className={inWatchlist ? 'fill-current' : ''}
                />
                <span>
                    {loading
                        ? 'Loading...'
                        : inWatchlist
                            ? 'Remove from Watchlist'
                            : 'Add to Watchlist'}
                </span>
            </button>
            {error && !user && (
                <p className="text-red-500 text-sm mt-2">
                    Please{' '}
                    <a href="/login" className="underline hover:text-red-400">
                        login
                    </a>
                    {' '}to use this feature
                </p>
            )}
            {error && user && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}
