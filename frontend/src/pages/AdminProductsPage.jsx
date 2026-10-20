import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../components/common/SEO';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CameraCaptureModal from '../components/common/CameraCaptureModal';
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleFeatured,
  adminToggleActive,
  adminGetEnquiries,
  adminUpdateEnquiryStatus,
  adminUpdateEnquiryNotes,
  adminUpdateEnquiryFollowUp,
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
  featured: false,
  variants: [
    { name: 'Red', hex: '#8B0000' },
    { name: 'Gold', hex: '#C5A059' },
  ],
};

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') === 'enquiries' ? 'enquiries' : 'products';
  const [activeTab, setActiveTab] = useState(initialTab); // 'products' | 'enquiries'

  // ================= PRODUCTS STATE =================
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [productPage, setProductPage] = useState(0);
  const [productSize, setProductSize] = useState(10);
  const [productSearchInput, setProductSearchInput] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productActiveFilter, setProductActiveFilter] = useState('ALL');
  const [productSortBy, setProductSortBy] = useState('newest');
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotalElements, setProductTotalElements] = useState(0);

  // ================= ENQUIRIES STATE =================
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState(null);
  const [enquiryPage, setEnquiryPage] = useState(0);
  const [enquirySize, setEnquirySize] = useState(10);
  const [enquirySearchInput, setEnquirySearchInput] = useState('');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('ALL');
  const [enquirySortBy, setEnquirySortBy] = useState('newest');
  const [enquiryTotalPages, setEnquiryTotalPages] = useState(1);
  const [enquiryTotalElements, setEnquiryTotalElements] = useState(0);

  // Enquiry detail modal state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminNoteText, setAdminNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteStatusMsg, setNoteStatusMsg] = useState(null);

  // Follow-up CRM state
  const [followUpDate, setFollowUpDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('');
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpStatusMsg, setFollowUpStatusMsg] = useState(null);

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

  // Fetch Products with server-side pagination & filtering
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);

      const params = {
        page: productPage,
        size: productSize,
        sortBy: productSortBy,
      };

      if (productSearch.trim()) {
        params.search = productSearch.trim();
      }
      if (productCategory.trim()) {
        params.category = productCategory.trim();
      }
      if (productActiveFilter === 'ACTIVE') {
        params.active = true;
      } else if (productActiveFilter === 'INACTIVE') {
        params.active = false;
      }

      const res = await adminGetProducts(params);
      if (res.data && Array.isArray(res.data.content)) {
        setProducts(res.data.content);
        setProductTotalPages(res.data.totalPages || 1);
        setProductTotalElements(res.data.totalElements || 0);
      } else if (Array.isArray(res.data)) {
        setProducts(res.data);
        setProductTotalPages(1);
        setProductTotalElements(res.data.length);
      } else {
        setProducts([]);
        setProductTotalPages(1);
        setProductTotalElements(0);
      }
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
  }, [productPage, productSize, productSearch, productCategory, productActiveFilter, productSortBy, navigate]);

  // Fetch Enquiries with server-side pagination & filtering
  const fetchEnquiries = useCallback(async () => {
    try {
      setLoadingEnquiries(true);
      setEnquiriesError(null);

      const params = {
        page: enquiryPage,
        size: enquirySize,
        sortBy: enquirySortBy,
      };

      if (enquirySearch.trim()) {
        params.search = enquirySearch.trim();
      }
      if (enquiryStatusFilter !== 'ALL') {
        params.status = enquiryStatusFilter;
      }

      const res = await adminGetEnquiries(params);
      if (res.data && Array.isArray(res.data.content)) {
        setEnquiries(res.data.content);
        setEnquiryTotalPages(res.data.totalPages || 1);
        setEnquiryTotalElements(res.data.totalElements || 0);
      } else if (Array.isArray(res.data)) {
        setEnquiries(res.data);
        setEnquiryTotalPages(1);
        setEnquiryTotalElements(res.data.length);
      } else {
        setEnquiries([]);
        setEnquiryTotalPages(1);
        setEnquiryTotalElements(0);
      }
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
  }, [enquiryPage, enquirySize, enquirySearch, enquiryStatusFilter, enquirySortBy, navigate]);

  // Auth check & initial data fetch
  useEffect(() => {
    const token = localStorage.getItem('saree_admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch products whenever tab is active or any product filter changes
  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, fetchProducts]);

  // Fetch enquiries whenever tab is active or any enquiry filter/search/pagination changes
  useEffect(() => {
    if (activeTab === 'enquiries') {
      fetchEnquiries();
    }
  }, [activeTab, fetchEnquiries]);

  // Tab switch
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'enquiries' ? { tab: 'enquiries' } : {});
  };

  // Product search submission
  const handleProductSearchSubmit = (e) => {
    e.preventDefault();
    setProductPage(0);
    if (productSearch === productSearchInput) {
      fetchProducts();
    } else {
      setProductSearch(productSearchInput);
    }
  };

  const handleProductResetFilters = () => {
    setProductSearchInput('');
    setProductSearch('');
    setProductCategory('');
    setProductActiveFilter('ALL');
    setProductSortBy('newest');
    setProductPage(0);
  };

  // Enquiry search submission — always reset to page 0 and apply the new search term.
  // If the search term hasn't changed (same value already committed), force a re-fetch directly.
  const handleEnquirySearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = enquirySearchInput.trim();
    if (enquiryPage !== 0) {
      setEnquiryPage(0); // useEffect will fire because enquiryPage changed → fetchEnquiries runs
    }
    if (enquirySearch === trimmed) {
      // State won't change, so useEffect won't re-fire — call directly
      fetchEnquiries();
    } else {
      setEnquirySearch(trimmed); // triggers useEffect → fetchEnquiries
    }
  };

  const handleEnquiryResetFilters = () => {
    setEnquirySearchInput('');
    setEnquirySearch('');
    setEnquiryStatusFilter('ALL');
    setEnquirySortBy('newest');
    setEnquiryPage(0);
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
      featured: Boolean(prod.featured),
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
      fetchProducts();
    } catch (err) {
      console.error('Delete product error:', err);
      alert('Failed to delete product. Please verify server connection.');
    }
  };

  // Toggle active/inactive
  const handleToggleActive = async (prod) => {
    try {
      const nextActive = !prod.active;
      await adminToggleActive(prod.id, nextActive);
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, active: nextActive } : p))
      );
    } catch (err) {
      console.error('Toggle active status error:', err);
      alert('Failed to update product active status.');
    }
  };

  // Toggle featured flag
  const handleToggleFeatured = async (prod) => {
    try {
      const nextFeatured = !prod.featured;
      await adminToggleFeatured(prod.id, nextFeatured);
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, featured: nextFeatured } : p))
      );
    } catch (err) {
      console.error('Toggle featured status error:', err);
      alert('Failed to update featured status.');
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

  // Form submit for create/edit product
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
      featured: Boolean(formData.featured),
    };

    try {
      if (imageFile) {
        setImageUploading(true);
        const uploadRes = await uploadProductImage(imageFile);
        payload.imageUrl = uploadRes.data.imageUrl;
      }

      if (isEditing) {
        await adminUpdateProduct(currentProductId, payload);
      } else {
        await adminCreateProduct(payload);
      }
      setIsModalOpen(false);
      fetchProducts();
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
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(res.data);
      }
    } catch (err) {
      console.error('Update enquiry status error:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // Open Enquiry Details Modal
  const handleOpenEnquiryDetail = (enq) => {
    setSelectedEnquiry(enq);
    setAdminNoteText(enq.adminNotes || '');
    setNoteStatusMsg(null);
    setFollowUpDate(enq.followUpDate || '');
    setAssignedTo(enq.assignedTo || '');
    setPreferredContactMethod(enq.preferredContactMethod || '');
    setFollowUpStatusMsg(null);
    setIsDetailModalOpen(true);
  };

  // Save Follow-up CRM fields
  const handleSaveFollowUp = async () => {
    if (!selectedEnquiry) return;
    try {
      setSavingFollowUp(true);
      setFollowUpStatusMsg(null);
      const res = await adminUpdateEnquiryFollowUp(selectedEnquiry.id, {
        followUpDate: followUpDate || null,
        assignedTo: assignedTo || null,
        preferredContactMethod: preferredContactMethod || null,
      });
      setSelectedEnquiry(res.data);
      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === selectedEnquiry.id ? res.data : enq))
      );
      setFollowUpStatusMsg({ type: 'success', text: 'Follow-up details saved!' });
      setTimeout(() => setFollowUpStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save follow-up:', err);
      setFollowUpStatusMsg({ type: 'error', text: 'Failed to save. Please retry.' });
    } finally {
      setSavingFollowUp(false);
    }
  };

  // Save Admin Internal Notes
  const handleSaveAdminNote = async () => {
    if (!selectedEnquiry) return;
    try {
      setSavingNote(true);
      setNoteStatusMsg(null);
      const res = await adminUpdateEnquiryNotes(selectedEnquiry.id, adminNoteText);
      setSelectedEnquiry(res.data);
      setEnquiries((prev) =>
        prev.map((enq) => (enq.id === selectedEnquiry.id ? res.data : enq))
      );
      setNoteStatusMsg({ type: 'success', text: 'Internal note saved successfully!' });
      setTimeout(() => setNoteStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save internal note:', err);
      setNoteStatusMsg({ type: 'error', text: 'Failed to save note. Please retry.' });
    } finally {
      setSavingNote(false);
    }
  };

  const statusColors = {
    NEW: 'bg-amber-100 text-amber-900 border-amber-300',
    CONTACTED: 'bg-blue-100 text-blue-900 border-blue-300',
    IN_PROGRESS: 'bg-purple-100 text-purple-900 border-purple-300',
    CLOSED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  };

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
                Products {productTotalElements > 0 ? `(${productTotalElements})` : `(${products.length})`}
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
                Enquiries {enquiryTotalElements > 0 ? `(${enquiryTotalElements})` : `(${enquiries.length})`}
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
          </div>

          {/* Tab 1: Products */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Product Search & Filter Bar */}
              <div className="rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] p-4 shadow-sm">
                <form onSubmit={handleProductSearchSubmit} className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative min-w-[220px] flex-1">
                    <input
                      type="text"
                      value={productSearchInput}
                      onChange={(e) => setProductSearchInput(e.target.value)}
                      placeholder="Search by SKU code or name..."
                      className="min-h-10 w-full rounded-lg border border-[#E5DAC8] bg-white px-3.5 py-2 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    />
                    {productSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setProductSearchInput('');
                          setProductSearch('');
                          setProductPage(0);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={productCategory}
                      onChange={(e) => {
                        setProductCategory(e.target.value);
                        setProductPage(0);
                      }}
                      className="min-h-10 w-full rounded-lg border border-[#E5DAC8] bg-white px-3 py-2 text-xs font-medium text-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="">All Categories</option>
                      {DEFAULT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Active/Inactive Filter */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={productActiveFilter}
                      onChange={(e) => {
                        setProductActiveFilter(e.target.value);
                        setProductPage(0);
                      }}
                      className="min-h-10 w-full rounded-lg border border-[#E5DAC8] bg-white px-3 py-2 text-xs font-medium text-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active Only</option>
                      <option value="INACTIVE">Inactive / Draft Only</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={productSortBy}
                      onChange={(e) => {
                        setProductSortBy(e.target.value);
                        setProductPage(0);
                      }}
                      className="min-h-10 w-full rounded-lg border border-[#E5DAC8] bg-white px-3 py-2 text-xs font-medium text-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="newest">Newest First</option>
                      <option value="featured">Featured First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Search and Reset Buttons */}
                  <button
                    type="submit"
                    className="rounded-lg bg-[#6B1626] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#52111d]"
                  >
                    Search
                  </button>

                  {(productSearch || productCategory || productActiveFilter !== 'ALL' || productSortBy !== 'newest') && (
                    <button
                      type="button"
                      onClick={handleProductResetFilters}
                      className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-2 text-xs font-medium text-[#55504E] hover:text-[#4A0E19]"
                    >
                      Reset
                    </button>
                  )}
                </form>
              </div>

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
                  <p className="text-sm font-semibold text-[#4A0E19]">No products found matching criteria.</p>
                  <p className="mt-1 text-xs text-[#55504E]">Try adjusting filters or adding a new saree weave.</p>
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
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Featured</th>
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
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(p)}
                                title={p.featured ? 'Click to unfeature' : 'Click to feature on homepage & catalogue'}
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                                  p.featured
                                    ? 'border-amber-400 bg-amber-100 text-amber-900 shadow-xs'
                                    : 'border-zinc-300 bg-zinc-100 text-zinc-500 hover:border-amber-400 hover:text-amber-800'
                                }`}
                              >
                                {p.featured ? '⭐ Featured' : '☆ Standard'}
                              </button>
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

              {/* Product Server-side Pagination Controls */}
              {productTotalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5DAC8] pt-4 sm:flex-row">
                  <div className="text-xs text-[#55504E]">
                    Showing <span className="font-semibold text-[#4A0E19]">{productPage * productSize + 1}</span> to{' '}
                    <span className="font-semibold text-[#4A0E19]">
                      {Math.min((productPage + 1) * productSize, productTotalElements)}
                    </span>{' '}
                    of <span className="font-semibold text-[#4A0E19]">{productTotalElements}</span> weaves
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={productPage === 0}
                      onClick={() => setProductPage((prev) => Math.max(0, prev - 1))}
                      className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-1.5 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2] disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <span className="px-2 text-xs font-semibold text-[#4A0E19]">
                      Page {productPage + 1} of {productTotalPages}
                    </span>

                    <button
                      type="button"
                      disabled={productPage >= productTotalPages - 1}
                      onClick={() => setProductPage((prev) => Math.min(productTotalPages - 1, prev + 1))}
                      className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-1.5 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2] disabled:opacity-40"
                    >
                      Next →
                    </button>

                    <select
                      value={productSize}
                      onChange={(e) => {
                        setProductSize(Number(e.target.value));
                        setProductPage(0);
                      }}
                      className="ml-2 rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-2 py-1 text-xs font-semibold text-[#4A0E19]"
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Enquiries */}
          {activeTab === 'enquiries' && (
            <div className="space-y-4">
              {/* Enquiry Search & Filter Bar */}
              <div className="rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] p-4 shadow-sm">
                <form onSubmit={handleEnquirySearchSubmit} className="flex flex-wrap items-center gap-3">
                  {/* Search Input */}
                  <div className="relative min-w-[220px] flex-1">
                    <input
                      type="text"
                      value={enquirySearchInput}
                      onChange={(e) => setEnquirySearchInput(e.target.value)}
                      placeholder="Search buyer name, boutique, or phone..."
                      className="min-h-10 w-full rounded-lg border border-[#E5DAC8] bg-white px-3.5 py-2 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    />
                    {enquirySearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setEnquirySearchInput('');
                          // If search was already empty, force a re-fetch; otherwise state change triggers useEffect
                          if (enquirySearch === '') {
                            setEnquiryPage(0);
                            fetchEnquiries();
                          } else {
                            setEnquirySearch('');
                            setEnquiryPage(0);
                          }
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={enquiryStatusFilter}
                      onChange={(e) => {
                        setEnquiryStatusFilter(e.target.value);
                        setEnquiryPage(0);
                      }}
                      className="min-h-10 w-full rounded-lg border border-[#E5DAC8] bg-white px-3 py-2 text-xs font-semibold text-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={enquirySortBy}
                      onChange={(e) => {
                        setEnquirySortBy(e.target.value);
                        setEnquiryPage(0);
                      }}
                      className="min-h-10 w-full rounded-lg border border-[#E5DAC8] bg-white px-3 py-2 text-xs font-semibold text-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>

                  {/* Search and Refresh Buttons */}
                  <button
                    type="submit"
                    className="rounded-lg bg-[#6B1626] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#52111d]"
                  >
                    Search
                  </button>

                  <button
                    type="button"
                    onClick={fetchEnquiries}
                    className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-2 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2]"
                  >
                    ↻ Refresh
                  </button>

                  {(enquirySearch || enquiryStatusFilter !== 'ALL' || enquirySortBy !== 'newest') && (
                    <button
                      type="button"
                      onClick={handleEnquiryResetFilters}
                      className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-2 text-xs font-medium text-[#55504E] hover:text-[#4A0E19]"
                    >
                      Reset
                    </button>
                  )}
                </form>
              </div>

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
              ) : enquiries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5DAC8] p-12 text-center">
                  <p className="text-sm font-semibold text-[#4A0E19]">No wholesale enquiries found matching your search.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] shadow-sm">
                  <table className="min-w-full divide-y divide-[#E5DAC8] text-left text-xs">
                    <thead className="bg-[#F4EFE6] text-[#4A0E19]">
                      <tr>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Buyer / Boutique</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Contact &amp; Location</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Target Item &amp; MOQ</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Internal Note</th>
                        <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Status Workflow</th>
                        <th className="px-4 py-3.5 text-right font-bold uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DAC8]">
                      {enquiries.map((enq) => {
                        const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '';
                        const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                        return (
                          <tr key={enq.id} className="transition-colors hover:bg-[#F4EFE6]/60">
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-[#4A0E19]">{enq.fullName}</div>
                              <div className="font-medium text-[#1F1C1D]">{enq.businessName}</div>
                              <div className="text-[10px] text-[#55504E]">
                                Recd: {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${enq.phone}`}
                                  className="font-mono font-bold text-[#6B1626] hover:underline"
                                  title="Click to Call"
                                >
                                  📞 {enq.phone}
                                </a>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Namaste ${enq.fullName}, regarding your Rajwada wholesale enquiry...`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                                    title="WhatsApp Buyer Directly"
                                  >
                                    WA 💬
                                  </a>
                                )}
                              </div>
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
                            <td className="max-w-[200px] px-4 py-3.5">
                              {enq.adminNotes ? (
                                <p className="line-clamp-2 text-xs italic text-[#55504E]">
                                  "{enq.adminNotes}"
                                </p>
                              ) : (
                                <span className="text-[11px] text-zinc-400">— No notes —</span>
                              )}
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
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleOpenEnquiryDetail(enq)}
                                className="rounded-lg border border-[#C5A059] bg-[#FAF7F2] px-3 py-1.5 text-xs font-semibold text-[#4A0E19] hover:bg-[#F4EFE6]"
                              >
                                View Details 📋
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Enquiry Server-side Pagination Controls */}
              {enquiryTotalPages > 1 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-[#E5DAC8] pt-4 sm:flex-row">
                  <div className="text-xs text-[#55504E]">
                    Showing <span className="font-semibold text-[#4A0E19]">{enquiryPage * enquirySize + 1}</span> to{' '}
                    <span className="font-semibold text-[#4A0E19]">
                      {Math.min((enquiryPage + 1) * enquirySize, enquiryTotalElements)}
                    </span>{' '}
                    of <span className="font-semibold text-[#4A0E19]">{enquiryTotalElements}</span> enquiries
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={enquiryPage === 0}
                      onClick={() => setEnquiryPage((prev) => Math.max(0, prev - 1))}
                      className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-1.5 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2] disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <span className="px-2 text-xs font-semibold text-[#4A0E19]">
                      Page {enquiryPage + 1} of {enquiryTotalPages}
                    </span>

                    <button
                      type="button"
                      disabled={enquiryPage >= enquiryTotalPages - 1}
                      onClick={() => setEnquiryPage((prev) => Math.min(enquiryTotalPages - 1, prev + 1))}
                      className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-1.5 text-xs font-semibold text-[#4A0E19] hover:bg-[#FAF7F2] disabled:opacity-40"
                    >
                      Next →
                    </button>

                    <select
                      value={enquirySize}
                      onChange={(e) => {
                        setEnquirySize(Number(e.target.value));
                        setEnquiryPage(0);
                      }}
                      className="ml-2 rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-2 py-1 text-xs font-semibold text-[#4A0E19]"
                    >
                      <option value={10}>10 / page</option>
                      <option value={20}>20 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Enquiry Full Detail View Modal */}
      {isDetailModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative my-8 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5DAC8] bg-[#FAF7F2] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between border-b border-[#E5DAC8] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A059]">Wholesale Buyer Lead</span>
                <h3 className="font-serif text-xl font-bold text-[#4A0E19]">
                  {selectedEnquiry.fullName} — {selectedEnquiry.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-md p-1.5 text-[#55504E] hover:bg-[#F4EFE6] hover:text-[#4A0E19]"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions: Click to Call & WhatsApp */}
            {(() => {
              const cleanPhone = selectedEnquiry.phone ? selectedEnquiry.phone.replace(/[^0-9]/g, '') : '';
              const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
              const waMsg = `Namaste ${selectedEnquiry.fullName}, thank you for your enquiry at Rajwada Sarees regarding ${selectedEnquiry.selectedProduct || 'our wholesale collection'}. How can we assist your boutique?`;
              return (
                <div className="mb-5 flex flex-wrap gap-2.5 rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-3">
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#6B1626] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#4A0E19]"
                  >
                    📞 Call Buyer ({selectedEnquiry.phone})
                  </a>
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      💬 WhatsApp Direct Chat
                    </a>
                  )}
                </div>
              );
            })()}

            {/* Structured Buyer & Requirement Info Grid */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#E5DAC8] bg-white p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Buyer Profile</div>
                <div className="mt-1 font-bold text-[#4A0E19]">{selectedEnquiry.fullName}</div>
                <div className="text-xs text-[#1F1C1D]">{selectedEnquiry.businessName}</div>
                <div className="text-xs text-[#55504E]">City: <span className="font-medium text-[#1F1C1D]">{selectedEnquiry.city || 'Not specified'}</span></div>
                <div className="text-xs text-[#55504E]">Phone: <span className="font-mono font-medium text-[#6B1626]">{selectedEnquiry.phone}</span></div>
              </div>

              <div className="rounded-lg border border-[#E5DAC8] bg-white p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Order Requirements</div>
                <div className="mt-1 font-bold text-[#4A0E19]">{selectedEnquiry.selectedProduct || 'General Catalogue Enquiry'}</div>
                <div className="text-xs text-[#55504E]">Requested Volume: <span className="font-semibold text-[#6B1626]">{selectedEnquiry.quantity || 'N/A'}</span></div>
                <div className="mt-2 text-[11px] text-[#55504E]">
                  Submitted: {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString('en-IN') : 'N/A'}
                </div>
                <div className="text-[11px] text-[#55504E]">
                  Last Updated: {selectedEnquiry.updatedAt ? new Date(selectedEnquiry.updatedAt).toLocaleString('en-IN') : (selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString('en-IN') : 'N/A')}
                </div>
              </div>
            </div>

            {/* Buyer Message */}
            <div className="mb-5 rounded-lg border border-[#E5DAC8] bg-white p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">Buyer Message / Enquiry Notes</div>
              <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-[#1F1C1D]">
                {selectedEnquiry.message || 'No additional note provided by the buyer.'}
              </p>
            </div>

            {/* Workflow Status Selector */}
            <div className="mb-5 rounded-lg border border-[#E5DAC8] bg-white p-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                Lead Status Workflow
              </label>
              <div className="mt-2 flex items-center gap-3">
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#C5A059] ${
                    statusColors[selectedEnquiry.status] || 'bg-zinc-100'
                  }`}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
                <span className="text-[11px] text-[#55504E]">
                  Updates immediately across the dashboard.
                </span>
              </div>
            </div>

            {/* Follow-up CRM Management */}
            <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50/60 p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm">📅</span>
                <label className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Follow-up & Lead Assignment
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mt-1 w-full rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="e.g. Ravi, Sales Team"
                    className="mt-1 w-full rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Preferred Contact
                  </label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value)}
                    className="mt-1 w-full rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">— Not specified —</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="EMAIL">Email</option>
                    <option value="IN_PERSON">In-Person Visit</option>
                  </select>
                </div>
              </div>
              {selectedEnquiry.lastContactedAt && (
                <p className="mt-2 text-[10px] text-blue-700">
                  Last Contacted: {new Date(selectedEnquiry.lastContactedAt).toLocaleString('en-IN')}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div>
                  {followUpStatusMsg && (
                    <span
                      className={`text-xs font-semibold ${
                        followUpStatusMsg.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {followUpStatusMsg.text}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={savingFollowUp}
                  onClick={handleSaveFollowUp}
                  className="rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
                >
                  {savingFollowUp ? 'Saving...' : 'Save Follow-up'}
                </button>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="mb-4 rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] p-3.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                Internal Admin Notes (Private to Team)
              </label>
              <textarea
                rows={3}
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                placeholder="Log internal follow-up details, quoted rates, shipping terms, sample requests..."
                className="mt-1.5 w-full rounded-md border border-[#E5DAC8] bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
              <div className="mt-2 flex items-center justify-between">
                <div>
                  {noteStatusMsg && (
                    <span
                      className={`text-xs font-semibold ${
                        noteStatusMsg.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {noteStatusMsg.text}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={handleSaveAdminNote}
                  className="rounded-lg bg-[#6B1626] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#4A0E19] disabled:opacity-50"
                >
                  {savingNote ? 'Saving Note...' : 'Save Note'}
                </button>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#E5DAC8] pt-3">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] px-4 py-2 text-xs font-semibold text-[#55504E] hover:bg-[#FAF7F2]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-[#6B1626] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#52111d] active:scale-98"
                      >
                        <span className="text-sm">📷</span>
                        <span>Open Camera / Webcam</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => mobileCameraInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-[#C5A059] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold text-[#4A0E19] transition hover:bg-[#F4EFE6] active:scale-98"
                      >
                        <span className="text-sm">📱</span>
                        <span>Phone Camera (Direct)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg border border-[#E5DAC8] bg-white px-3 py-2 text-xs font-medium text-[#55504E] transition hover:bg-[#FAF7F2] hover:text-[#4A0E19] active:scale-98"
                      >
                        <span className="text-sm">📁</span>
                        <span>Upload from Files</span>
                      </button>
                    </div>

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

                {/* Featured Checkbox */}
                <div className="sm:col-span-2 rounded-lg border border-[#E5DAC8] bg-[#F4EFE6] p-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.featured)}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 rounded border-[#E5DAC8] text-[#6B1626] focus:ring-[#C5A059]"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#4A0E19]">
                        ⭐ Mark as Featured Saree
                      </span>
                      <p className="text-[11px] text-[#55504E]">
                        Featured sarees are showcased directly on the homepage and prioritized in catalogue searches.
                      </p>
                    </div>
                  </label>
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
