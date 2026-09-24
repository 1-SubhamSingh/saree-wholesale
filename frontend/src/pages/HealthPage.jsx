import { useEffect, useState } from 'react';
import api from '../services/api';

export default function HealthPage() {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/health')
      .then((response) => {
        if (response.data && response.data.status === 'UP') {
          setStatus('UP');
          setError(false);
        } else {
          setStatus('Backend unavailable');
          setError(true);
        }
      })
      .catch(() => {
        setStatus('Backend unavailable');
        setError(true);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-slate-100">System Health</h1>
        <div className="mt-4 p-4 rounded-lg bg-slate-800 border border-slate-700">
          <p className="text-lg font-medium">
            Backend Status:{' '}
            <span className={error ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
              {status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
