import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-slate-100">Saree Wholesale</h1>
        <p className="text-slate-400 mb-6">Frontend &amp; Backend Connection Verified</p>
        <Link
          to="/health"
          className="inline-block px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Check System Health
        </Link>
      </div>
    </div>
  );
}
