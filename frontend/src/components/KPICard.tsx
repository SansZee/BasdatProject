import { useEffect, useState } from "react";

interface KPIMetrics {
    total_produced: {
        total_produced: number;
        top_type: Array<{
            count: number;
            type_name: string;
        }>;
    };
    average_rating: {
        average_rating: number;
    };
    top_genre: {
        genre_name: string;
        total_title: number;
        average_rating: number;
    };
}

interface KPICardProps {
    companyID: string;
}

export default function KPICard({ companyID }: KPICardProps) {
    const [kpi, setKpi] = useState<KPIMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKPI = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/dashboard/kpi?company_id=${companyID}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch KPI data");
                }

                const data = await response.json();
                setKpi(data.data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                setKpi(null);
            } finally {
                setLoading(false);
            }
        };

        if (companyID) {
            fetchKPI();
        }
    }, [companyID]);

    if (loading) {
        return (
            <div className="text-center text-light/60 py-6">
                Loading KPI data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 py-6">Error: {error}</div>
        );
    }

    if (!kpi) {
        return (
            <div className="text-center text-light/60 py-6">
                No KPI data available
            </div>
        );
    }



    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Shows Produced Card */}
            <div className="bg-gradient-to-br from-secondary to-primary border border-accent/30 rounded-lg shadow-lg p-6 hover:border-accent/60 transition-all flex flex-col">
                <div className="flex items-center justify-between mb-0">
                    <h3 className="text-light/80 text-xs font-semibold uppercase tracking-wide">
                        Total Productions
                    </h3>
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-accent text-lg">📺</span>
                    </div>
                </div>
                <div className="flex items-center justify-center mb-0">
                    <p className="text-6xl font-bold text-accent mb-4">
                        {kpi.total_produced.total_produced}
                    </p>
                </div>
                {kpi.total_produced.top_type.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-accent/20 space-y-2">
                        {kpi.total_produced.top_type.map((type, idx) => (
                            <div
                                key={idx}
                                className="flex justify-between items-center bg-primary/50 p-2 rounded text-xs"
                            >
                                <span className="text-light/70">{type.type_name}</span>
                                <span className="font-bold text-accent">{type.count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Average Rating Card */}
            <div className="bg-gradient-to-br from-secondary to-primary border border-accent/30 rounded-lg shadow-lg p-6 hover:border-accent/60 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-light/80 text-xs font-semibold uppercase tracking-wide">
                        Average Rating
                    </h3>
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-accent text-lg">⭐</span>
                    </div>
                </div>
                <div className="flex items-center justify-center mb-4">
                    <p className="text-7xl font-bold text-accent">
                        {kpi.average_rating.average_rating.toFixed(1)}
                    </p>
                    <p className="text-light/60 text-lg ml-2">/10</p>
                </div>
                <div className="pt-4 border-t border-accent/20">
                    <div className="w-full bg-primary/50 rounded-full h-3">
                        <div
                            className="bg-accent rounded-full h-3 transition-all duration-500"
                            style={{
                                width: `${(kpi.average_rating.average_rating / 10) * 100}%`,
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Top Genre Card */}
            <div className="bg-gradient-to-br from-secondary to-primary border border-accent/30 rounded-lg shadow-lg p-6 hover:border-accent/60 transition-all flex flex-col">
                <div className="flex items-center justify-between mb-0">
                    <h3 className="text-light/80 text-xs font-semibold uppercase tracking-wide">
                        Top Genre
                    </h3>
                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                        <span className="text-accent text-lg">🎬</span>
                    </div>
                </div>
                <div className="flex items-center justify-center mb-0">
                    <p className="text-4xl font-bold text-accent mb-4">
                        {kpi.top_genre.genre_name}
                    </p>
                </div>
                <div className="mt-auto pt-4 border-t border-accent/20 space-y-2">
                    <div className="flex justify-between items-center bg-primary/50 p-2 rounded text-xs">
                        <span className="text-light/70">Total Titles</span>
                        <span className="font-bold text-accent">
                            {kpi.top_genre.total_title}
                        </span>
                    </div>
                    <div className="flex justify-between items-center bg-primary/50 p-2 rounded text-xs">
                        <span className="text-light/70">Avg. Rating</span>
                        <span className="font-bold text-accent">
                            {kpi.top_genre.average_rating.toFixed(2)}/10
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
