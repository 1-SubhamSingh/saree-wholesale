import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { adminGetDashboardStats } from '../services/api';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminUser = localStorage.getItem('saree_admin_user') || 'Admin';

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminGetDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('saree_admin_token');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch dashboard statistics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('saree_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('saree_admin_token');
    localStorage.removeItem('saree_admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title="Admin Operations Dashboard"
        description="Wholesale metrics, catalogue performance, and enquiry pipeline."
      />

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#E5DAC8] bg-[#FAF7F2]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-serif text-xl font-bold tracking-tight text-[#4A0E19] sm:text-2xl">
              Rajwada <span className="text-[#C5A059]">Admin</span>
            </Link>
            <span className="hidden rounded-full border border-[#C5A059]/40 bg-[#6B1626]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6B1626] sm:inline">
              Wholesale Portal
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/catalogue"
              target="_blank"
              className="hidden text-xs font-semibold text-[#55504E] hover:text-[#4A0E19] sm:inline"
            >
              Live Catalogue ↗
            </Link>
            <Link
              to="/admin/products"
              className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-1.5 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2]"
            >
              Manage Products
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-[#6B1626] px-3 py-1.5 text-xs font-semibold text-[#FAF7F2] transition-colors hover:bg-[#4A0E19]"
            >
              Sign Out ({adminUser})
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome Banner */}
          <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-[#C5A059]/30 bg-gradient-to-r from-[#4A0E19] to-[#6B1626] p-6 text-[#FAF7F2] shadow-md sm:flex-row sm:items-center sm:p-8">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E8D39E]">
                Management Overview
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#FAF7F2] sm:text-3xl">
                Loom Inventory &amp; Wholesale Enquiry Stats
              </h1>
              <p className="text-xs text-[#FAF7F2]/80 sm:text-sm">
                Real-time metrics connected to MongoDB and Spring Boot business services.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/admin/products"
                className="inline-flex items-center justify-center rounded-lg border border-[#C5A059] bg-[#E8D39E] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#4A0E19] shadow transition-transform hover:scale-[1.02]"
              >
                + Add New Saree
              </Link>
              <button
                onClick={fetchStats}
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-white/20"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Calculating wholesale warehouse metrics..." />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
                <div className="rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 shadow-sm sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#55504E]">
                    Total Products
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold text-[#4A0E19] sm:text-4xl">
                    {stats?.totalProducts ?? 0}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#55504E]">
                    <span className="font-semibold text-emerald-700">
                      {stats?.activeProducts ?? 0} active
                    </span>
                    <span>•</span>
                    <span className="text-amber-700">
                      {stats?.inactiveProducts ?? 0} draft
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 shadow-sm sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#55504E]">
                    Total Enquiries
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold text-[#6B1626] sm:text-4xl">
                    {stats?.totalEnquiries ?? 0}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[#C5A059]">
                    Lifetime B2B Submissions
                  </p>
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    New Actionable
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold text-amber-900 sm:text-4xl">
                    {stats?.newEnquiries ?? 0}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-amber-800">
                    Awaiting First Response
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4 shadow-sm sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                    In Progress / Deals
                  </p>
                  <p className="mt-2 font-serif text-3xl font-bold text-emerald-900 sm:text-4xl">
                    {(stats?.contactedEnquiries ?? 0) + (stats?.inProgressEnquiries ?? 0)}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-emerald-800">
                    Active Wholesale Discussions
                  </p>
                </div>
              </div>

              {/* Status Breakdown Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Enquiry Pipeline */}
                <div className="rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-5 shadow-sm sm:p-6">
                  <h3 className="font-serif text-lg font-bold text-[#4A0E19]">
                    Wholesale Enquiry Pipeline
                  </h3>
                  <p className="mb-4 text-xs text-[#55504E]">
                    Buyer conversion breakdown across workflow stages.
                  </p>

                  <div className="space-y-3">
                    {[
                      { key: 'NEW', label: 'New / Unattended', count: stats?.newEnquiries ?? 0, color: 'bg-amber-500' },
                      { key: 'CONTACTED', label: 'Contacted via WhatsApp/Phone', count: stats?.contactedEnquiries ?? 0, color: 'bg-blue-500' },
                      { key: 'IN_PROGRESS', label: 'Negotiation / Swatch Sent', count: stats?.inProgressEnquiries ?? 0, color: 'bg-purple-500' },
                      { key: 'CLOSED', label: 'Order Placed / Closed', count: stats?.closedEnquiries ?? 0, color: 'bg-emerald-600' },
                    ].map((st) => {
                      const total = stats?.totalEnquiries || 1;
                      const pct = Math.round((st.count / total) * 100);
                      return (
                        <div key={st.key} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[#1F1C1D]">{st.label}</span>
                            <span className="text-[#4A0E19]">{st.count} ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5DAC8]">
                            <div
                              className={`h-full rounded-full ${st.color} transition-all duration-500`}
                              style={{ width: `${Math.max(pct, st.count > 0 ? 5 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Inventory Breakdown */}
                <div className="rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-5 shadow-sm sm:p-6">
                  <h3 className="font-serif text-lg font-bold text-[#4A0E19]">
                    Catalogues by Weave Category
                  </h3>
                  <p className="mb-4 text-xs text-[#55504E]">
                    Distribution of live varieties across handloom types.
                  </p>

                  {stats?.productsByCategory && Object.keys(stats.productsByCategory).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(stats.productsByCategory).map(([cat, count]) => {
                        const total = stats?.totalProducts || 1;
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-[#1F1C1D]">{cat}</span>
                              <span className="text-[#6B1626]">{count} items</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5DAC8]">
                              <div
                                className="h-full rounded-full bg-[#6B1626] transition-all duration-500"
                                style={{ width: `${Math.max(pct, 5)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-[#55504E]">No category metrics recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="flex flex-col gap-4 rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#4A0E19]">
                    Ready to update catalogues or review incoming B2B leads?
                  </h4>
                  <p className="text-xs text-[#55504E]">
                    Add high-resolution saree photos, bulk MOQ tiers, and set color shade swatches.
                  </p>
                </div>
                <Link
                  to="/admin/products"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#6B1626] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#4A0E19]"
                >
                  Open Product Manager ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
