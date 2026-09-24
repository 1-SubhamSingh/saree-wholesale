import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/common/SEO';
import { ALL_SAREES } from '../data/mockData';

export default function EnquiryPage() {
  const [searchParams] = useSearchParams();
  const initialProduct = searchParams.get('product') || '';
  const initialSku = searchParams.get('sku') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    phone: '',
    city: '',
    selectedProduct: initialProduct ? `${initialProduct} (${initialSku})` : '',
    quantity: '5 Sets',
    message: initialProduct ? `Interested in bulk ordering ${initialProduct} (${initialSku}). Please share price list & swatch box details.` : '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialProduct && !formData.selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        selectedProduct: `${initialProduct} (${initialSku})`,
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Simulate submission delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      businessName: '',
      phone: '',
      city: '',
      selectedProduct: '',
      quantity: '5 Sets',
      message: '',
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1F1C1D]">
      <SEO
        title="Wholesale Bulk Enquiry"
        description="Submit a B2B wholesale enquiry to Rajwada Sarees. Get direct loom pricing, catalogue swatch boxes, and bulk order assistance."
      />
      <Navbar />

      <main className="flex-grow py-8 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center space-y-3 mb-10">
            <span className="px-3.5 py-1.5 rounded-full bg-[#6B1626]/10 border border-[#6B1626]/20 text-[#6B1626] text-xs font-semibold uppercase tracking-widest">
              Direct B2B Sales Desk
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#4A0E19]">
              Wholesale Bulk Enquiry
            </h1>
            <p className="text-sm sm:text-base text-[#55504E] max-w-xl mx-auto">
              Fill out the form below to receive catalogue PDFs, volume price slabs, and swatch boxes.
            </p>
          </div>

          {/* Form / Success Card */}
          <div className="bg-[#F4EFE6] border border-[#E5DAC8] rounded-2xl p-6 sm:p-10 shadow-sm">
            
            {submitted ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 mx-auto flex items-center justify-center text-3xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-bold text-[#4A0E19]">
                    Enquiry Received Successfully!
                  </h2>
                  <p className="text-sm text-[#55504E] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-[#1F1C1D]">{formData.fullName}</strong> ({formData.businessName}). Our B2B executive will contact you on <strong className="text-[#6B1626]">{formData.phone}</strong> via phone/WhatsApp within 2 business hours.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 rounded-lg bg-[#6B1626] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider shadow-sm hover:bg-[#4A0E19]"
                  >
                    Send Another Enquiry
                  </button>
                  <Link
                    to="/catalogue"
                    className="px-6 py-3 rounded-lg bg-[#FAF7F2] border border-[#E5DAC8] text-[#4A0E19] font-semibold text-xs uppercase tracking-wider hover:bg-[#F4EFE6]"
                  >
                    Return to Catalogue
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A0E19] block">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-[#FAF7F2] border text-sm focus:outline-none transition-all ${
                        errors.fullName
                          ? 'border-red-500 focus:ring-2 focus:ring-red-300'
                          : 'border-[#E5DAC8] focus:ring-2 focus:ring-[#C5A059]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Business Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A0E19] block">
                      Boutique / Business Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      placeholder="e.g. Shringar Saree Boutique"
                      value={formData.businessName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-[#FAF7F2] border text-sm focus:outline-none transition-all ${
                        errors.businessName
                          ? 'border-red-500 focus:ring-2 focus:ring-red-300'
                          : 'border-[#E5DAC8] focus:ring-2 focus:ring-[#C5A059]'
                      }`}
                    />
                    {errors.businessName && (
                      <p className="text-xs text-red-600 font-medium">{errors.businessName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A0E19] block">
                      Mobile / WhatsApp No. <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="10-digit Mobile Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-[#FAF7F2] border text-sm focus:outline-none transition-all ${
                        errors.phone
                          ? 'border-red-500 focus:ring-2 focus:ring-red-300'
                          : 'border-[#E5DAC8] focus:ring-2 focus:ring-[#C5A059]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-600 font-medium">{errors.phone}</p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A0E19] block">
                      City / State <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Jaipur, Rajasthan"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg bg-[#FAF7F2] border text-sm focus:outline-none transition-all ${
                        errors.city
                          ? 'border-red-500 focus:ring-2 focus:ring-red-300'
                          : 'border-[#E5DAC8] focus:ring-2 focus:ring-[#C5A059]'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-xs text-red-600 font-medium">{errors.city}</p>
                    )}
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A0E19] block">
                      Target Saree Catalogue / Item
                    </label>
                    <select
                      name="selectedProduct"
                      value={formData.selectedProduct}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#FAF7F2] border border-[#E5DAC8] text-sm text-[#1F1C1D] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="">General Wholesale Inquiry (All Catalogues)</option>
                      {ALL_SAREES.map((s) => (
                        <option key={s.id} value={`${s.name} (${s.sku})`}>
                          {s.name} ({s.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#4A0E19] block">
                      Estimated Requirement <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-[#FAF7F2] border border-[#E5DAC8] text-sm text-[#1F1C1D] focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                    >
                      <option value="5 Sets">5 - 10 Sets (Trial Pack)</option>
                      <option value="15 Sets">15 - 30 Sets (Boutique Order)</option>
                      <option value="50+ Sets">50+ Sets (Showroom Bulk)</option>
                      <option value="Custom Order">Custom Weaving / Export Bulk</option>
                    </select>
                  </div>

                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#4A0E19] block">
                    Message / Special Customization Request
                  </label>
                  <textarea
                    rows={4}
                    name="message"
                    placeholder="Provide details about your required color variants, target price point, or delivery timeline..."
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-[#FAF7F2] border border-[#E5DAC8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-lg bg-[#6B1626] hover:bg-[#4A0E19] text-[#FAF7F2] font-semibold text-sm tracking-wider uppercase border border-[#C5A059]/40 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting B2B Request...</span>
                    </>
                  ) : (
                    <span>Submit Wholesale Enquiry</span>
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
