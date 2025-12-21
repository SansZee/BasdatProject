import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { ReviewPanel } from '../components/ReviewPanel';
import { useAuth } from '../context/AuthContext';
import { Film, Heart, Calendar, Mail } from 'lucide-react';

export function ProfilePage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

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

            {/* Profile Header with Reviews */}
            <div className="bg-gradient-to-b from-secondary to-primary py-12">
                <div className="max-w-[1600px] mx-auto px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info */}
                        <div className="lg:col-span-1">
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

                        </div>

                        {/* Reviews Preview */}
                        <div className="lg:col-span-2">
                            <ReviewPanel userId={user.user_id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
