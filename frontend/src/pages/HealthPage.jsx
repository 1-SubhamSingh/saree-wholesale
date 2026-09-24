import { useEffect, useState } from 'react';
import api from '../services/api';

export default function HealthPage() {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get('/health')
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
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-5 text-center shadow-xl sm:p-8">
        <div className="mb-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
            Rajwada Sarees
          </p>

          <h1 className="text-2xl font-bold leading-tight text-slate-100 sm:text-3xl">
            System Health
          </h1>
        </div>

        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 p-4 sm:p-5">
          <p className="text-sm font-medium leading-relaxed text-slate-300 sm:text-lg">
            Backend Status:{' '}
            <span
              className={
                error
                  ? 'font-semibold text-red-400'
                  : 'font-semibold text-emerald-400'
              }
            >
              {status}
            </span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span
            className={`h-2 w-2 rounded-full ${
              error
                ? 'bg-red-400'
                : status === 'UP'
                  ? 'bg-emerald-400'
                  : 'animate-pulse bg-yellow-400'
            }`}
          />
          <span>
            {status === 'Checking...'
              ? 'Checking backend connection...'
              : error
                ? 'Connection unavailable'
                : 'Backend connection active'}
          </span>
        </div>
      </div>
    </div>
  );
}