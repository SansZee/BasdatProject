import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navigation } from '../components/shared/Navigation';
import { titlesAPI, TitleDetailResponse } from '../api/titles';

/**
 * Debug page to compare what backend sends vs what frontend receives
 * Navigate to: /titles/1396/debug
 * Then compare logs in console
 */
export function TitleDetailDebug() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const test = async () => {
      if (!id) {
        setError('No ID');
        setLoading(false);
        return;
      }

      try {
        console.log('\n========== BACKEND vs FRONTEND DEBUG ==========\n');
        
        // Manual fetch to see raw response
        console.log('1️⃣  Raw Fetch Test:');
        const fetchRes = await fetch(`http://localhost:8080/api/titles/${id}/detail`);
        const fetchJson = await fetchRes.json();
        console.log('   Status:', fetchRes.status);
        console.log('   Response structure:', Object.keys(fetchJson));
        console.log('   Full response:', JSON.stringify(fetchJson, null, 2));
        
        // API service test
        console.log('\n2️⃣  API Service Test:');
        const apiData = await titlesAPI.getTitleDetail(id);
        console.log('   API returned type:', typeof apiData);
        console.log('   API returned structure:', Object.keys(apiData || {}));
        console.log('   API data:', JSON.stringify(apiData, null, 2));

        // Comparison
        console.log('\n3️⃣  Comparison:');
        console.log('   fetch response.data.data === apiData?', 
          JSON.stringify(fetchJson.data.data) === JSON.stringify(apiData));
        console.log('   fetch has detail?', !!fetchJson.data?.detail);
        console.log('   api has detail?', !!apiData?.detail);
        console.log('   fetch genres count:', fetchJson.data?.genres?.length || 0);
        console.log('   api genres count:', apiData?.genres?.length || 0);

        // State test
        console.log('\n4️⃣  Setting State:');
        setData(apiData);
        console.log('   State will be set to:', JSON.stringify(apiData, null, 2));

        setError(null);
      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    test();
  }, [id]);

  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      <div className="max-w-[1600px] mx-auto px-8 py-16">
        <h1 className="text-light text-4xl font-bold mb-8">🐛 Detail Debug Page</h1>
        
        <div className="bg-secondary p-6 rounded-lg border border-gray-600 mb-8">
          <h2 className="text-light text-xl font-bold mb-4">Instructions:</h2>
          <ol className="text-gray-300 space-y-2 ml-4">
            <li>1. Open DevTools (F12) → Console tab</li>
            <li>2. You should see detailed logs with comparisons</li>
            <li>3. Check if backend and frontend data match</li>
            <li>4. Share the console output if something looks wrong</li>
          </ol>
        </div>

        {loading && (
          <div className="text-gray-400">
            <p>Loading debug info...</p>
            <p className="text-sm text-gray-500">Check console (F12) for detailed logs</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg">
            Error: {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-lg">
              ✅ Data received and set in state successfully!
            </div>

            <div className="bg-secondary p-6 rounded-lg border border-gray-600">
              <h3 className="text-light text-xl font-bold mb-4">📊 Data Overview</h3>
              <dl className="space-y-2 text-gray-300">
                <div>
                  <dt className="font-bold text-light">Title:</dt>
                  <dd>{data?.detail?.name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-bold text-light">Rating:</dt>
                  <dd>{data?.detail?.vote_average || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-bold text-light">Genres:</dt>
                  <dd>{data?.genres?.length || 0}</dd>
                </div>
                <div>
                  <dt className="font-bold text-light">Languages:</dt>
                  <dd>{data?.languages?.length || 0}</dd>
                </div>
                <div>
                  <dt className="font-bold text-light">Countries:</dt>
                  <dd>{data?.countries?.length || 0}</dd>
                </div>
                <div>
                  <dt className="font-bold text-light">Companies:</dt>
                  <dd>{data?.companies?.length || 0}</dd>
                </div>
                <div>
                  <dt className="font-bold text-light">Networks:</dt>
                  <dd>{data?.networks?.length || 0}</dd>
                </div>
                <div>
                  <dt className="font-bold text-light">Cast & Crew:</dt>
                  <dd>{data?.cast_and_crew?.length || 0}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-secondary p-6 rounded-lg border border-gray-600">
              <h3 className="text-light text-xl font-bold mb-4">📋 Full JSON Response</h3>
              <pre className="bg-primary p-4 rounded text-xs text-gray-300 overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
