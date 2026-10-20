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
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4">
                <div className="rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#55504E]">
                    Total Products
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-[#4A0E19] sm:text-3xl">
                    {stats?.totalProducts ?? 0}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[#55504E]">
                    <span className="font-semibold text-emerald-700">{stats?.activeProducts ?? 0} active</span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#55504E]">
                    Total Enquiries
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-[#6B1626] sm:text-3xl">
                    {stats?.totalEnquiries ?? 0}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-[#C5A059]">
                    {stats?.todayEnquiries ? `+${stats.todayEnquiries} Today` : 'Lifetime Leads'}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    New Leads
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-amber-900 sm:text-3xl">
                    {stats?.newEnquiries ?? 0}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-amber-800">
                    Needs Contact
                  </p>
                </div>

                <div className="rounded-xl border border-purple-300 bg-purple-50/80 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                    In Progress
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-purple-900 sm:text-3xl">
                    {stats?.inProgressEnquiries ?? 0}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-purple-800">
                    Active Deals
                  </p>
                </div>

                <div className="rounded-xl border border-blue-300 bg-blue-50/80 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                    Pending Follow-ups
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-blue-900 sm:text-3xl">
                    {stats?.pendingFollowUps ?? ((stats?.todayFollowUps ?? 0) + (stats?.overdueFollowUps ?? 0))}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-blue-800">
                    {stats?.todayFollowUps ?? 0} Today • {stats?.overdueFollowUps ?? 0} Overdue
                  </p>
                </div>

                <div className="rounded-xl border border-red-300 bg-red-50/80 p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-900">
                    Overdue Follow-ups
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-red-900 sm:text-3xl">
                    {stats?.overdueFollowUps ?? 0}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-red-800">
                    Action Required
                  </p>
                </div>
              </div>

              {/* MINI CRM SECTIONS */}
              <div className="space-y-6">
                {/* 1. Today's Follow-ups */}
                <div className="rounded-xl border border-blue-200 bg-[#FAF7F2] p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5DAC8] pb-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">📅</span>
                        <h2 className="font-serif text-lg font-bold text-[#4A0E19]">Today's Follow-ups</h2>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                          {stats?.todayFollowUps ?? 0} Scheduled
                        </span>
                      </div>
                      <p className="text-xs text-[#55504E] mt-0.5">Wholesale buyers scheduled for callback or order finalisation today.</p>
                    </div>
                    <Link
                      to="/admin/products?tab=enquiries&followUp=today"
                      className="text-xs font-bold text-blue-700 hover:text-blue-900"
                    >
                      View All Today's Follow-ups ➔
                    </Link>
                  </div>

                  {stats?.todayFollowUpsList && stats.todayFollowUpsList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs divide-y divide-[#E5DAC8]">
                        <thead className="bg-[#F4EFE6] text-[#4A0E19]">
                          <tr>
                            <th className="px-3 py-2.5 font-bold uppercase">Buyer / Business</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Contact</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Product &amp; Volume</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Assigned To</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Notes</th>
                            <th className="px-3 py-2.5 text-right font-bold uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DAC8]">
                          {stats.todayFollowUpsList.map((enq) => {
                            const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '';
                            const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                            return (
                              <tr key={enq.id} className="hover:bg-[#F4EFE6]/50">
                                <td className="px-3 py-2.5">
                                  <div className="font-bold text-[#4A0E19]">{enq.fullName}</div>
                                  <div className="text-[#55504E]">{enq.businessName} • {enq.city}</div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="font-mono text-[#6B1626] font-semibold">{enq.phone}</div>
                                  {enq.preferredContactMethod && (
                                    <span className="text-[10px] font-bold text-blue-700 uppercase">
                                      Pref: {enq.preferredContactMethod}
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="font-medium text-[#1F1C1D]">{enq.selectedProduct || 'General Enquiry'}</div>
                                  <div className="text-[#55504E]">{enq.quantity}</div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                                    {enq.assignedTo || 'Unassigned'}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 max-w-[180px] truncate text-[#55504E]">
                                  {enq.adminNotes || '—'}
                                </td>
                                <td className="px-3 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Namaste ${enq.fullName}, following up from Rajwada Sarees regarding your wholesale enquiry.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                                      title="WhatsApp"
                                    >
                                      WA 💬
                                    </a>
                                  )}
                                  <Link
                                    to="/admin/products?tab=enquiries"
                                    className="rounded border border-[#C5A059] bg-[#FAF7F2] px-2.5 py-1 text-[11px] font-semibold text-[#4A0E19] hover:bg-[#F4EFE6]"
                                  >
                                    Manage ➔
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#55504E] italic">
                      ✨ No follow-ups scheduled for today. Great job staying on top of leads!
                    </div>
                  )}
                </div>

                {/* 2. Overdue Follow-ups */}
                <div className="rounded-xl border border-red-200 bg-[#FAF7F2] p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5DAC8] pb-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">⚠️</span>
                        <h2 className="font-serif text-lg font-bold text-red-900">Overdue Follow-ups</h2>
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                          {stats?.overdueFollowUps ?? 0} Pending
                        </span>
                      </div>
                      <p className="text-xs text-[#55504E] mt-0.5">Leads whose scheduled follow-up date has passed without closing.</p>
                    </div>
                    <Link
                      to="/admin/products?tab=enquiries&followUp=overdue"
                      className="text-xs font-bold text-red-700 hover:text-red-900"
                    >
                      View All Overdue Follow-ups ➔
                    </Link>
                  </div>

                  {stats?.overdueFollowUpsList && stats.overdueFollowUpsList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-xs divide-y divide-[#E5DAC8]">
                        <thead className="bg-red-50 text-red-900">
                          <tr>
                            <th className="px-3 py-2.5 font-bold uppercase">Buyer / Business</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Contact</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Due Date</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Assigned To</th>
                            <th className="px-3 py-2.5 font-bold uppercase">Last Contacted</th>
                            <th className="px-3 py-2.5 text-right font-bold uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5DAC8]">
                          {stats.overdueFollowUpsList.map((enq) => {
                            const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '';
                            const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                            return (
                              <tr key={enq.id} className="hover:bg-red-50/40">
                                <td className="px-3 py-2.5">
                                  <div className="font-bold text-[#4A0E19]">{enq.fullName}</div>
                                  <div className="text-[#55504E]">{enq.businessName} • {enq.city}</div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="font-mono text-[#6B1626] font-semibold">{enq.phone}</div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="font-bold text-red-700 bg-red-100 rounded px-2 py-0.5">
                                    {enq.followUpDate}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-[#1F1C1D]">
                                    {enq.assignedTo || 'Unassigned'}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-[#55504E]">
                                  {enq.lastContactedAt ? new Date(enq.lastContactedAt).toLocaleDateString('en-IN') : 'Never'}
                                </td>
                                <td className="px-3 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Namaste ${enq.fullName}, checking in from Rajwada Sarees regarding your bulk enquiry.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                                      title="WhatsApp"
                                    >
                                      WA 💬
                                    </a>
                                  )}
                                  <Link
                                    to="/admin/products?tab=enquiries"
                                    className="rounded border border-[#6B1626] bg-[#6B1626] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#4A0E19]"
                                  >
                                    Take Action ➔
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-emerald-700 font-medium">
                      ✓ No overdue follow-ups! All buyer leads are actively handled.
                    </div>
                  )}
                </div>

                {/* 3 & 4. New Enquiries and In-Progress Enquiries Side-by-Side */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* New Enquiries */}
                  <div className="rounded-xl border border-amber-200 bg-[#FAF7F2] p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#E5DAC8] pb-3 mb-3">
                      <div>
                        <h2 className="font-serif text-base font-bold text-amber-900">
                          New Wholesale Enquiries ({stats?.newEnquiries ?? 0})
                        </h2>
                        <p className="text-[11px] text-[#55504E]">Recent submissions requiring initial contact.</p>
                      </div>
                      <Link
                        to="/admin/products?tab=enquiries&status=NEW"
                        className="text-xs font-bold text-[#6B1626] hover:underline"
                      >
                        All New ➔
                      </Link>
                    </div>

                    {stats?.newEnquiriesList && stats.newEnquiriesList.length > 0 ? (
                      <div className="space-y-2.5">
                        {stats.newEnquiriesList.map((enq) => {
                          const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '';
                          const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                          return (
                            <div key={enq.id} className="flex items-center justify-between rounded-lg border border-[#E5DAC8] bg-[#F4EFE6]/60 p-2.5 text-xs">
                              <div className="min-w-0 pr-2">
                                <div className="font-bold text-[#4A0E19] truncate">{enq.fullName} ({enq.businessName})</div>
                                <div className="text-[11px] text-[#55504E] truncate">{enq.selectedProduct || 'Catalogue'} • {enq.city}</div>
                                <div className="text-[10px] text-[#C5A059] font-medium font-mono">{enq.phone}</div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Namaste ${enq.fullName}, thank you for your enquiry at Rajwada Sarees.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                                  >
                                    WA
                                  </a>
                                )}
                                <Link
                                  to="/admin/products?tab=enquiries"
                                  className="rounded border border-[#C5A059] bg-[#FAF7F2] px-2 py-1 text-[10px] font-semibold text-[#4A0E19]"
                                >
                                  Open
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-xs text-[#55504E]">No new unattended enquiries.</p>
                    )}
                  </div>

                  {/* In-Progress Enquiries */}
                  <div className="rounded-xl border border-purple-200 bg-[#FAF7F2] p-5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#E5DAC8] pb-3 mb-3">
                      <div>
                        <h2 className="font-serif text-base font-bold text-purple-900">
                          In-Progress Negotiations ({stats?.inProgressEnquiries ?? 0})
                        </h2>
                        <p className="text-[11px] text-[#55504E]">Active price quotes, swatch shipments &amp; bulk discussions.</p>
                      </div>
                      <Link
                        to="/admin/products?tab=enquiries&status=IN_PROGRESS"
                        className="text-xs font-bold text-[#6B1626] hover:underline"
                      >
                        All In-Progress ➔
                      </Link>
                    </div>

                    {stats?.inProgressEnquiriesList && stats.inProgressEnquiriesList.length > 0 ? (
                      <div className="space-y-2.5">
                        {stats.inProgressEnquiriesList.map((enq) => {
                          const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '';
                          const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                          return (
                            <div key={enq.id} className="flex items-center justify-between rounded-lg border border-[#E5DAC8] bg-[#F4EFE6]/60 p-2.5 text-xs">
                              <div className="min-w-0 pr-2">
                                <div className="font-bold text-[#4A0E19] truncate">{enq.fullName} ({enq.businessName})</div>
                                <div className="text-[11px] text-[#55504E] truncate">
                                  {enq.assignedTo ? `Rep: ${enq.assignedTo} • ` : ''}Next: {enq.followUpDate || 'Not set'}
                                </div>
                                <div className="text-[10px] italic text-[#55504E] truncate">{enq.adminNotes || 'No notes'}</div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Namaste ${enq.fullName}, following up from Rajwada Sarees.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                                  >
                                    WA
                                  </a>
                                )}
                                <Link
                                  to="/admin/products?tab=enquiries"
                                  className="rounded border border-[#C5A059] bg-[#FAF7F2] px-2 py-1 text-[10px] font-semibold text-[#4A0E19]"
                                >
                                  Open
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="py-4 text-center text-xs text-[#55504E]">No in-progress discussions recorded.</p>
                    )}
                  </div>
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

              {/* Recent Activity: Latest Products & Enquiries */}
              {((stats?.recentEnquiries && stats.recentEnquiries.length > 0) ||
                (stats?.recentProducts && stats.recentProducts.length > 0)) && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {stats.recentEnquiries && stats.recentEnquiries.length > 0 && (
                    <div className="rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] p-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#E5DAC8] pb-3 mb-3">
                        <h3 className="font-serif text-base font-bold text-[#4A0E19]">Recent Buyer Enquiries</h3>
                        <Link to="/admin/products?tab=enquiries" className="text-xs font-semibold text-[#6B1626] hover:underline">
                          View All ➔
                        </Link>
                      </div>
                      <div className="space-y-2">
                        {stats.recentEnquiries.slice(0, 5).map((enq) => (
                          <div key={enq.id} className="flex items-center justify-between rounded-lg bg-[#F4EFE6]/60 p-2.5 text-xs">
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-[#4A0E19] truncate">{enq.fullName} ({enq.businessName || enq.city || 'Buyer'})</div>
                              <div className="text-[11px] text-[#55504E] truncate">{enq.selectedProduct || 'Catalogue Request'} • Status: {enq.status}</div>
                            </div>
                            <span className="shrink-0 text-[10px] text-[#C5A059] font-mono">
                              {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-IN') : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.recentProducts && stats.recentProducts.length > 0 && (
                    <div className="rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] p-5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#E5DAC8] pb-3 mb-3">
                        <h3 className="font-serif text-base font-bold text-[#4A0E19]">Recently Updated Sarees</h3>
                        <Link to="/admin/products?tab=products" className="text-xs font-semibold text-[#6B1626] hover:underline">
                          View All ➔
                        </Link>
                      </div>
                      <div className="space-y-2">
                        {stats.recentProducts.slice(0, 5).map((prod) => (
                          <div key={prod.id} className="flex items-center justify-between rounded-lg bg-[#F4EFE6]/60 p-2.5 text-xs">
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-[#4A0E19] truncate">{prod.name}</div>
                              <div className="text-[11px] text-[#55504E] truncate">SKU: {prod.sku} • ₹{prod.price} • {prod.category}</div>
                            </div>
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${prod.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {prod.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
