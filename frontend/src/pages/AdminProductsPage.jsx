import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/common/SEO';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CameraCaptureModal from '../components/common/CameraCaptureModal';
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetEnquiries,
  adminUpdateEnquiryStatus,
} from '../services/api';
import { uploadProductImage, validateImageFile } from '../services/imageUpload';

const DEFAULT_CATEGORIES = [
  'Silk Sarees',
  'Banarasi Weave',
  'Designer Collection',
  'Festive & Party',
  'Cotton Handloom',
  'Georgette & Chiffon',
];

const DEFAULT_FABRICS = [
  'Pure Mulberry Silk',
  'Katan Silk Brocade',
  'Viscose Organza',
  'Chanderi Silk Cotton',
  'Tussar Silk',
  'Pure Georgette',
];

const EMPTY_PRODUCT_FORM = {
  sku: '',
  name: '',
  category: 'Silk Sarees',
  fabric: 'Pure Mulberry Silk',
  color: 'Crimson Red',
  price: '',
  priceTier: '',
  minOrder: '5 Pieces (Set)',
  description: '',
  sareeLength: '5.5 Meters + 0.8m Blouse Piece',
  blouseIncluded: true,
  careInstructions: 'Dry Clean Only',
  badge: 'New Arrival',
  imageUrl: '',
  active: true,
  variants: [
    { name: 'Red', hex: '#8B0000' },
    { name: 'Gold', hex: '#C5A059' },
  ],
};

export default function AdminProductsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'enquiries'

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Enquiries state
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState(null);
  const [enquiryFilter, setEnquiryFilter] = useState('ALL');

  // Modal State for Product CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_PRODUCT_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  // Variant input inside modal
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantHex, setNewVariantHex] = useState('#6B1626');

  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);
      const res = await adminGetProducts();
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load admin products:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('saree_admin_token');
        navigate('/admin/login');
      } else {
        setProductsError('Failed to fetch product inventory.');
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [navigate]);

  // Check auth
  useEffect(() => {
    const token = localStorage.getItem('saree_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [navigate, fetchProducts]);

  const fetchEnquiries = async () => {
    try {
      setLoadingEnquiries(true);
      setEnquiriesError(null);
      const res = await adminGetEnquiries();
      setEnquiries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('saree_admin_token');
        navigate('/admin/login');
      } else {
        setEnquiriesError('Failed to load wholesale enquiries.');
      }
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'enquiries' && enquiries.length === 0) {
      fetchEnquiries();
    }
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormData({ ...EMPTY_PRODUCT_FORM });
    setImageFile(null);
    setImagePreview('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (prod) => {
    setIsEditing(true);
    setCurrentProductId(prod.id);
    setFormData({
      sku: prod.sku || '',
      name: prod.name || '',
      category: prod.category || 'Silk Sarees',
      fabric: prod.fabric || 'Pure Mulberry Silk',
      color: prod.color || 'Crimson Red',
      price: prod.price != null ? prod.price : '',
      priceTier: prod.priceTier || '',
      minOrder: prod.minOrder || '5 Pieces (Set)',
      description: prod.description || '',
      sareeLength: prod.sareeLength || '5.5 Meters + 0.8m Blouse Piece',
      blouseIncluded: prod.blouseIncluded !== false,
      careInstructions: prod.careInstructions || 'Dry Clean Only',
      badge: prod.badge || '',
      imageUrl: prod.imageUrl || '',
      active: prod.active !== false,
      variants: Array.isArray(prod.variants) ? prod.variants : [],
    });
    setImageFile(null);
    setImagePreview(prod.imageUrl || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Delete product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${name}"?`)) {
      return;
    }
    try {
      await adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Failed to delete product. Please verify server connection.');
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (prod) => {
    try {
      const updated = { ...prod, active: !prod.active };
      await adminUpdateProduct(prod.id, updated);
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, active: !p.active } : p))
      );
    } catch (err) {
      console.error('Toggle active status error:', err);
      alert('Failed to update product status.');
    }
  };

  // Add color variant in modal
  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;
    setFormData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { name: newVariantName.trim(), hex: newVariantHex }],
    }));
    setNewVariantName('');
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      setFormError('Product Name and SKU are mandatory.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const payload = {
      ...formData,
      price: formData.price !== '' ? Number(formData.price) : 0,
      priceTier: formData.priceTier.trim() || `₹${formData.price || 0} / piece`,
    };

    try {
      if (imageFile) {
        setImageUploading(true);
        const uploadRes = await uploadProductImage(imageFile);
        payload.imageUrl = uploadRes.data.imageUrl;
      }

      if (isEditing) {
        const res = await adminUpdateProduct(currentProductId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === currentProductId ? res.data : p))
        );
      } else {
        const res = await adminCreateProduct(payload);
        setProducts((prev) => [res.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Product save error:', err);
      setFormError(err.response?.data?.message || 'Failed to save product catalogue.');
    } finally {
      setFormSubmitting(false);
      setImageUploading(false);
    }
  };

  // Update enquiry status
  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await adminUpdateEnquiryStatus(enquiryId, newStatus);
      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === enquiryId ? res.data : enq))
      );
    } catch (err) {
      console.error('Update enquiry status error:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (enquiryFilter === 'ALL') return true;
    return e.status === enquiryFilter;
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title="Admin Product & Enquiry Management"
        description="Complete CRUD operations for sarees, inventory, variants, and wholesale enquiry workflows."
      />

      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-[#E5DAC8] bg-[#FAF7F2]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="font-serif text-xl font-bold tracking-tight text-[#4A0E19] sm:text-2xl">
              Rajwada <span className="text-[#C5A059]">Admin</span>
            </Link>
            <span className="hidden rounded-full border border-[#C5A059]/40 bg-[#6B1626]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6B1626] sm:inline">
              Catalogue Management
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/admin/dashboard"
              className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-1.5 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2]"
            >
              Dashboard
            </Link>
            <Link
              to="/catalogue"
              target="_blank"
              className="hidden rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#55504E] hover:text-[#4A0E19] sm:inline"
            >
              Storefront ↗
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('saree_admin_token');
                localStorage.removeItem('saree_admin_user');
                navigate('/admin/login');
              }}
              className="rounded-lg bg-[#6B1626] px-3 py-1.5 text-xs font-semibold text-[#FAF7F2] hover:bg-[#4A0E19]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="mb-6 flex flex-col gap-4 border-b border-[#E5DAC8] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTabChange('products')}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'products'
                    ? 'bg-[#6B1626] text-[#FAF7F2] shadow-sm'
                    : 'bg-[#F4EFE6] text-[#55504E] hover:bg-[#FAF7F2]'
                }`}
              >
                Products ({products.length})
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('enquiries')}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'enquiries'
                    ? 'bg-[#6B1626] text-[#FAF7F2] shadow-sm'
                    : 'bg-[#F4EFE6] text-[#55504E] hover:bg-[#FAF7F2]'
                }`}
              >
                Enquiries {enquiries.length > 0 && `(${enquiries.length})`}
              </button>
            </div>

            {activeTab === 'products' && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#C5A059] bg-[#E8D39E] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#4A0E19] shadow transition-transform hover:scale-[1.02]"
              >
                + Create New Saree Catalogue
              </button>
            )}

            {activeTab === 'enquiries' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#55504E]">Filter Status:</span>
                <select
                  value={enquiryFilter}
                  onChange={(e) => setEnquiryFilter(e.target.value)}
                  className="rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#4A0E19]"
                >
                  <option value="ALL">All Enquiries</option>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <button
                  type="button"
                  onClick={fetchEnquiries}
                  className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-1.5 text-xs font-semibold text-[#4A0E19]"
                >
                  ↻ Refresh
                </button>
              </div>
            )}
          </div>

          {/* Tab 1: Products */}
          {activeTab === 'products' && (
            <div>
              {loadingProducts ? (
                <LoadingSpinner message="Fetching saree inventory from database..." />
              ) : productsError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
                  {productsError}
                  <button
                    onClick={fetchProducts}
                    className="ml-3 rounded bg-[#6B1626] px-3 py-1 text-xs text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5DAC8] p-12 text-center">
                  <p className="text-sm font-semibold text-[#4A0E19]">No products found in catalogue.</p>
                  <p className="mt-1 text-xs text-[#55504E]">Click "+ Create New Saree Catalogue" to add your first weave.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] shadow-sm">
                  <table className="min-w-full divide-y divide-[#E5DAC8] text-left text-xs">
                    <thead className="bg-[#F4EFE6] text-[#4A0E19]">
                      <tr>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Item / SKU</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Fabric</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Price / MOQ</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Shades</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3.5 text-right font-bold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DAC8]">
                      {products.map((p) => {
                        const hasImg = Boolean(p.imageUrl && p.imageUrl.trim());
                        return (
                          <tr key={p.id} className="transition-colors hover:bg-[#F4EFE6]/60">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {hasImg ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="h-12 w-12 rounded-lg object-cover border border-[#E5DAC8]"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#E5DAC8] bg-[#6B1626]/10 text-xl">
                                    🥻
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-[#4A0E19]">{p.name}</div>
                                  <div className="font-mono text-[11px] text-[#C5A059]">{p.sku}</div>
                                  {p.badge && (
                                    <span className="inline-block rounded bg-[#6B1626]/10 px-1.5 py-0.2 text-[9px] font-bold text-[#6B1626]">
                                      {p.badge}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#1F1C1D]">{p.category}</td>
                            <td className="px-4 py-3 text-[#55504E]">{p.fabric}</td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-[#6B1626]">
                                {p.priceTier || `₹${p.price} / piece`}
                              </div>
                              <div className="text-[11px] text-[#55504E]">MOQ: {p.minOrder}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {p.variants && p.variants.length > 0 ? (
                                  p.variants.map((v, idx) => (
                                    <span
                                      key={idx}
                                      title={v.name}
                                      className="h-4 w-4 rounded-full border border-black/20"
                                      style={{ backgroundColor: v.hex || '#6B1626' }}
                                    />
                                  ))
                                ) : (
                                  <span className="text-[#55504E]">{p.color}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(p)}
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  p.active !== false
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-zinc-200 text-zinc-700'
                                }`}
                              >
                                {p.active !== false ? '● Active' : '○ Inactive'}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  to={`/product/${p.id}`}
                                  target="_blank"
                                  className="rounded p-1 text-[#55504E] hover:text-[#4A0E19]"
                                  title="View on Storefront"
                                >
                                  👁️
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(p)}
                                  className="rounded border border-[#E5DAC8] bg-[#F4EFE6] px-2.5 py-1 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Enquiries */}
          {activeTab === 'enquiries' && (
            <div>
              {loadingEnquiries ? (
                <LoadingSpinner message="Loading wholesale enquiries from buyer desk..." />
              ) : enquiriesError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">
                  {enquiriesError}
                  <button
                    onClick={fetchEnquiries}
                    className="ml-3 rounded bg-[#6B1626] px-3 py-1 text-xs text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5DAC8] p-12 text-center">
                  <p className="text-sm font-semibold text-[#4A0E19]">No wholesale enquiries found matching status '{enquiryFilter}'.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] shadow-sm">
                  <table className="min-w-full divide-y divide-[#E5DAC8] text-left text-xs">
                    <thead className="bg-[#F4EFE6] text-[#4A0E19]">
                      <tr>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Buyer / Boutique</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Contact &amp; Location</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Target Item &amp; MOQ</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Message</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Status Workflow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DAC8]">
                      {filteredEnquiries.map((enq) => {
                        const statusColors = {
                          NEW: 'bg-amber-100 text-amber-900 border-amber-300',
                          CONTACTED: 'bg-blue-100 text-blue-900 border-blue-300',
                          IN_PROGRESS: 'bg-purple-100 text-purple-900 border-purple-300',
                          CLOSED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                        };

                        return (
                          <tr key={enq.id} className="transition-colors hover:bg-[#F4EFE6]/60">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-[#4A0E19]">{enq.fullName}</div>
                              <div className="font-medium text-[#1F1C1D]">{enq.businessName}</div>
                              <div className="text-[10px] text-[#55504E]">
                                {enq.createdAt ? new Date(enq.createdAt).toLocaleString('en-IN') : 'Recent'}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <a
                                href={`tel:${enq.phone}`}
                                className="font-mono font-bold text-[#6B1626] hover:underline"
                              >
                                {enq.phone}
                              </a>
                              <div className="text-[11px] text-[#55504E]">{enq.city}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-[#1F1C1D]">
                                {enq.selectedProduct || 'General Enquiry'}
                              </div>
                              <span className="inline-block rounded border border-[#C5A059]/40 bg-[#E8D39E]/30 px-2 py-0.5 text-[10px] font-bold text-[#4A0E19]">
                                Req: {enq.quantity}
                              </span>
                            </td>
                            <td className="max-w-xs px-4 py-3.5">
                              <p className="line-clamp-3 text-xs leading-relaxed text-[#55504E]">
                                {enq.message || 'No additional note provided.'}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <select
                                value={enq.status}
                                onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                                  statusColors[enq.status] || 'bg-zinc-100'
                                }`}
                              >
                                <option value="NEW">NEW</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="CLOSED">CLOSED</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5DAC8] bg-[#FAF7F2] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#E5DAC8] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#4A0E19]">
                {isEditing ? 'Edit Saree Catalogue' : 'Add New Saree Weave'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1.5 text-[#55504E] hover:bg-[#F4EFE6] hover:text-[#4A0E19]"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Catalogue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Royal Kanjivaram Pure Silk"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="RS-KAN-001"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Category
                  </label>
                  <input
                    list="category-suggestions"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                  <datalist id="category-suggestions">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Fabric Quality
                  </label>
                  <input
                    list="fabric-suggestions"
                    type="text"
                    value={formData.fabric}
                    onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                  <datalist id="fabric-suggestions">
                    {DEFAULT_FABRICS.map((f) => (
                      <option key={f} value={f} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Wholesale Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2500"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Price Tier Label
                  </label>
                  <input
                    type="text"
                    value={formData.priceTier}
                    onChange={(e) => setFormData({ ...formData, priceTier: e.target.value })}
                    placeholder="₹2,500 / piece (Wholesale)"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Minimum Order Quantity (MOQ)
                  </label>
                  <input
                    type="text"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    placeholder="5 Pieces (Set)"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Promotional Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Bestseller / New / Trending"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                      Product Image
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData((prev) => ({ ...prev, imageUrl: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                          if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
                        }}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <div className="mt-1 rounded-xl border border-dashed border-[#C5A059] bg-[#F4EFE6] p-4">
                    {imagePreview ? (
                      <div className="relative mb-3 overflow-hidden rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] p-2">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="h-52 w-full rounded-md object-contain"
                        />
                        {imageFile && (
                          <span className="absolute bottom-4 left-4 rounded-full bg-[#6B1626] px-2.5 py-1 text-[10px] font-semibold text-white shadow-md">
                            Ready to upload: {imageFile.name}
                          </span>
                        )}
                      </div>
                    ) : null}

                    {/* Camera and Upload Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Button 1: Live Webcam / Phone Camera Viewfinder */}
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#6B1626] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#52111d] active:scale-98"
                      >
                        <span className="text-sm">📷</span>
                        <span>Open Camera / Webcam</span>
                      </button>

                      {/* Button 2: Direct Phone Native Camera */}
                      <button
                        type="button"
                        onClick={() => mobileCameraInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-[#C5A059] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold text-[#4A0E19] transition hover:bg-[#F4EFE6] active:scale-98"
                      >
                        <span className="text-sm">📱</span>
                        <span>Phone Camera (Direct)</span>
                      </button>

                      {/* Button 3: Browse Files */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-[#E5DAC8] bg-white px-3 py-2 text-xs font-medium text-[#55504E] transition hover:bg-[#FAF7F2] hover:text-[#4A0E19] active:scale-98"
                      >
                        <span className="text-sm">📁</span>
                        <span>Upload from Files</span>
                      </button>
                    </div>

                    {/* Hidden Native File & Camera Inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const error = validateImageFile(file);
                        if (error) {
                          setFormError(error);
                          setImageFile(null);
                          return;
                        }
                        setFormError(null);
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }}
                    />

                    <input
                      ref={mobileCameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const error = validateImageFile(file);
                        if (error) {
                          setFormError(error);
                          setImageFile(null);
                          return;
                        }
                        setFormError(null);
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }}
                    />

                    <p className="mt-2 text-[11px] text-[#55504E]">
                      Take a photo with your webcam / phone camera, or choose a file (JPEG, PNG, WebP, GIF up to 5 MB).
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Existing / External Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or hosted web image"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                  <p className="mt-1 text-[11px] text-[#55504E]">
                    Provide a direct HTTPS photo URL or leave empty to use Rajwada silk gradient placeholder.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Primary Tone / Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Crimson Red"
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                    Catalogue Status
                  </label>
                  <select
                    value={formData.active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                    className="mt-1 min-h-10 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  >
                    <option value="active">Active (Visible in Public Catalogue)</option>
                    <option value="inactive">Inactive / Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Color Shade Variants Manager */}
              <div className="rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-3.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                  Color Shade Variants (Swatch Sets)
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {formData.variants &&
                    formData.variants.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DAC8] bg-[#FAF7F2] px-2.5 py-1 text-xs"
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border"
                          style={{ backgroundColor: v.hex }}
                        />
                        <span>{v.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          className="ml-1 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    placeholder="New Shade Name (e.g. Peacock Blue)"
                    className="min-h-9 flex-1 rounded border border-[#E5DAC8] bg-[#FAF7F2] px-2.5 py-1 text-xs"
                  />
                  <input
                    type="color"
                    value={newVariantHex}
                    onChange={(e) => setNewVariantHex(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-[#E5DAC8] p-0"
                    title="Select swatch hex color"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="rounded bg-[#6B1626] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4A0E19]"
                  >
                    + Add Shade
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                  Description &amp; Loom Weave Specifications
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details regarding zari grade, warp/weft density, and occasion suitability..."
                  className="mt-1 w-full rounded-md border border-[#E5DAC8] bg-[#FAF7F2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#E5DAC8] pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-4 py-2 text-xs font-semibold text-[#55504E] hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-lg bg-[#6B1626] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#FAF7F2] hover:bg-[#4A0E19] disabled:opacity-60"
                >
                  {formSubmitting || imageUploading
                    ? imageUploading ? 'Uploading image...' : 'Saving...'
                    : isEditing
                    ? 'Update Catalogue'
                    : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file, previewUrl) => {
          setFormError(null);
          setImageFile(file);
          setImagePreview(previewUrl);
        }}
      />
    </div>
  );
}
