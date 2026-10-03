import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { adminLogin } from '../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: 'admin1',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await adminLogin(credentials);
      if (res.data?.token) {
        localStorage.setItem('saree_admin_token', res.data.token);
        localStorage.setItem('saree_admin_user', res.data.username);
        navigate('/admin/dashboard');
      } else {
        setError('Login failed: Token not received.');
      }
    } catch (err) {
      console.error('Admin login error:', err?.message || 'Authentication error');
      setError(err.response?.data?.message || 'Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-center bg-[#FAF7F2] px-4 py-12 sm:px-6 lg:px-8">
      <SEO
        title="Admin Portal Login"
        description="Secure management access for Rajwada Sarees wholesale portal."
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <span className="inline-block rounded-full border border-[#C5A059]/40 bg-[#6B1626] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#E8D39E]">
            Internal Operations
          </span>
          <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#4A0E19] sm:text-4xl">
            Rajwada Wholesale Admin
          </h2>
          <p className="mt-2 text-xs text-[#55504E]">
            Catalogue inventory management, bulk pricing, and enquiry desk.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E5DAC8] bg-[#F4EFE6] p-6 shadow-md sm:p-8">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
              >
                Admin Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={credentials.username}
                onChange={handleChange}
                placeholder="admin1"
                className="mt-1.5 min-h-11 w-full rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-4 py-2.5 text-sm text-[#1F1C1D] transition-colors focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5 min-h-11 w-full rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-4 py-2.5 text-sm text-[#1F1C1D] transition-colors focus:border-[#C5A059] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <p className="mt-1 text-[11px] text-[#55504E]">
                Default dev credential: <code className="font-mono font-semibold">admin123</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#C5A059]/40 bg-[#6B1626] px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-[#FAF7F2] shadow-md transition-all hover:bg-[#4A0E19] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign In to Dashboard ➔'
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs font-medium text-[#6B1626] hover:text-[#4A0E19] hover:underline"
          >
            ← Return to Wholesale Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
