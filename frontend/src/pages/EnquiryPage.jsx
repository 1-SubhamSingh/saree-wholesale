import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/common/SEO';
import { getProducts, submitEnquiry } from '../services/api';

export default function EnquiryPage() {
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get('product') || '';
  const initialSku = searchParams.get('sku') || '';

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    city: '',
    selectedProduct: initialProduct
      ? `${initialProduct} (${initialSku})`
      : '',
    quantity: '5 Sets',
    message: initialProduct
      ? `Interested in bulk ordering ${initialProduct} (${initialSku}). Please share price list & swatch box details.`
      : ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    // Load active products from backend for product dropdown
    getProducts()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setProducts(res.data.filter((p) => p.active !== false));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch products for enquiry dropdown:', err);
      });
  }, []);

  useEffect(() => {
    if (initialProduct && !formData.selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        selectedProduct: `${initialProduct} (${initialSku})`
      }));
    }
  }, [initialProduct, initialSku, formData.selectedProduct]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Boutique or Company Name is required.';
    }

    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone / WhatsApp number is required.';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City / Location is required.';
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Estimated quantity is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitEnquiry({
        fullName: formData.fullName.trim(),
        businessName: formData.businessName.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        selectedProduct: formData.selectedProduct || 'General Wholesale Inquiry',
        quantity: formData.quantity,
        message: formData.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit enquiry:', err);
      setSubmitError(
        err.response?.data?.message ||
          'Failed to send enquiry. Please check your network connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      businessName: '',
      phone: '',
      city: '',
      selectedProduct: '',
      quantity: '5 Sets',
      message: ''
    });

    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
  };

  const inputClass = (error) =>
    `min-h-11 w-full rounded-lg border bg-[#FAF7F2] px-4 py-3 text-sm text-[#1F1C1D] transition-all focus:outline-none ${
      error
        ? 'border-red-500 focus:ring-2 focus:ring-red-300'
        : 'border-[#E5DAC8] focus:ring-2 focus:ring-[#C5A059]'
    }`;

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title="Wholesale Bulk Enquiry"
        description="Submit a B2B wholesale enquiry to Rajwada Sarees. Get direct loom pricing, catalogue swatch boxes, and bulk order assistance."
      />

      <Navbar />

      <main className="flex-grow py-8 sm:py-16">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-3 text-center sm:mb-10">
            <span className="inline-block max-w-full rounded-full border border-[#6B1626]/20 bg-[#6B1626]/10 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B1626] sm:text-xs sm:tracking-widest">
              Direct B2B Sales Desk
            </span>

            <h1 className="font-serif text-3xl font-bold leading-tight text-[#4A0E19] sm:text-5xl">
              Wholesale Bulk Enquiry
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#55504E] sm:text-base">
              Fill out the form below to receive catalogue PDFs, volume price slabs, and swatch boxes.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E5DAC8] bg-[#F4EFE6] p-4 shadow-sm sm:p-10">
            {submitted ? (
              <div className="space-y-6 py-6 text-center sm:py-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 text-2xl text-emerald-700 sm:h-16 sm:w-16 sm:text-3xl">
                  ✓
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-2xl font-bold leading-tight text-[#4A0E19] sm:text-3xl">
                    Enquiry Received Successfully!
                  </h2>

                  <p className="mx-auto max-w-md text-sm leading-relaxed text-[#55504E]">
                    Thank you,{' '}
                    <strong className="text-[#1F1C1D]">
                      {formData.fullName}
                    </strong>{' '}
                    ({formData.businessName}). Our B2B executive will review your request and contact
                    you on{' '}
                    <strong className="text-[#6B1626]">
                      {formData.phone}
                    </strong>{' '}
                    via phone/WhatsApp within 2 business hours.
                  </p>
                </div>

                <div className="flex flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4 sm:pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#6B1626] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-sm transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 sm:w-auto"
                  >
                    Send Another Enquiry
                  </button>

                  <Link
                    to="/catalogue"
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#4A0E19] transition-colors hover:bg-[#F4EFE6] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 sm:w-auto"
                  >
                    Return to Catalogue
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
                    >
                      Full Name <span className="text-red-600">*</span>
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      className={inputClass(errors.fullName)}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={
                        errors.fullName ? 'fullName-error' : undefined
                      }
                    />

                    {errors.fullName && (
                      <p
                        id="fullName-error"
                        className="text-xs font-medium text-red-600"
                      >
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="businessName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
                    >
                      Boutique / Business Name{' '}
                      <span className="text-red-600">*</span>
                    </label>

                    <input
                      id="businessName"
                      type="text"
                      name="businessName"
                      placeholder="e.g. Shringar Saree Boutique"
                      value={formData.businessName}
                      onChange={handleChange}
                      autoComplete="organization"
                      className={inputClass(errors.businessName)}
                      aria-invalid={Boolean(errors.businessName)}
                      aria-describedby={
                        errors.businessName
                          ? 'businessName-error'
                          : undefined
                      }
                    />

                    {errors.businessName && (
                      <p
                        id="businessName-error"
                        className="text-xs font-medium text-red-600"
                      >
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
                    >
                      Mobile / WhatsApp No.{' '}
                      <span className="text-red-600">*</span>
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="10-digit Mobile Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClass(errors.phone)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={
                        errors.phone ? 'phone-error' : undefined
                      }
                    />

                    {errors.phone && (
                      <p
                        id="phone-error"
                        className="text-xs font-medium text-red-600"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="city"
                      className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
                    >
                      City / State <span className="text-red-600">*</span>
                    </label>

                    <input
                      id="city"
                      type="text"
                      name="city"
                      placeholder="e.g. Jaipur, Rajasthan"
                      value={formData.city}
                      onChange={handleChange}
                      autoComplete="address-level2"
                      className={inputClass(errors.city)}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={
                        errors.city ? 'city-error' : undefined
                      }
                    />

                    {errors.city && (
                      <p
                        id="city-error"
                        className="text-xs font-medium text-red-600"
                      >
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="selectedProduct"
                      className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
                    >
                      Target Saree Catalogue / Item
                    </label>

                    <select
                      id="selectedProduct"
                      name="selectedProduct"
                      value={formData.selectedProduct}
                      onChange={handleChange}
                      className="min-h-11 w-full rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-4 py-3 text-sm text-[#1F1C1D] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="">
                        General Wholesale Inquiry (All Catalogues)
                      </option>

                      {products.map((s) => (
                        <option
                          key={s.id}
                          value={`${s.name} (${s.sku})`}
                        >
                          {s.name} ({s.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="quantity"
                      className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
                    >
                      Estimated Requirement{' '}
                      <span className="text-red-600">*</span>
                    </label>

                    <select
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="min-h-11 w-full rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-4 py-3 text-sm text-[#1F1C1D] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="5 Sets">
                        5 - 10 Sets (Trial Pack)
                      </option>
                      <option value="10-25 Sets">
                        10 - 25 Sets (Boutique Stock)
                      </option>
                      <option value="25-50 Sets">
                        25 - 50 Sets (Showroom Batch)
                      </option>
                      <option value="50+ Sets">
                        50+ Sets (Wholesale / Bulk Export)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="min-w-0 space-y-1.5">
                  <label
                    htmlFor="message"
                    className="block text-xs font-bold uppercase tracking-wider text-[#4A0E19]"
                  >
                    Custom Requirements / Specific Weave Inquiries
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us about your boutique location, GST status, required colors, or custom packaging needs..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E5DAC8] bg-[#FAF7F2] px-4 py-3 text-sm text-[#1F1C1D] transition-all focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#C5A059]/40 bg-[#6B1626] px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-lg transition-all hover:bg-[#4A0E19] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
                      Submitting Enquiry...
                    </span>
                  ) : (
                    'Submit Wholesale Enquiry ➔'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}