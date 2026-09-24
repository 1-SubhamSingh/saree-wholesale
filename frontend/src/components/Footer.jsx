export default function Footer() {
  return (
    <footer id="contact" className="bg-[#1F1C1D] text-[#FAF7F2] border-t border-[#C5A059]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#55504E]/40">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#6B1626] border border-[#C5A059] flex items-center justify-center text-[#E8D39E] font-serif text-lg font-bold">
                R
              </div>
              <span className="font-serif text-2xl font-bold tracking-wide text-[#FAF7F2] uppercase">
                Rajwada <span className="text-[#C5A059]">Sarees</span>
              </span>
            </div>
            <p className="text-sm text-[#FAF7F2]/70 leading-relaxed max-w-sm">
              Premier manufacturer &amp; wholesale exporter of authentic Indian sarees. Specializing in Kanjivaram, Banarasi, Chanderi, and contemporary designer collections.
            </p>
            <div className="pt-2 text-xs text-[#C5A059] font-medium tracking-wider uppercase">
              ✦ Surat &amp; Kanchipuram Weaving Hubs
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-[#E8D39E]">Categories</h4>
            <ul className="space-y-2 text-sm text-[#FAF7F2]/70">
              <li><a href="#collections" className="hover:text-[#C5A059] transition-colors">Silk Sarees</a></li>
              <li><a href="#collections" className="hover:text-[#C5A059] transition-colors">Banarasi Brocade</a></li>
              <li><a href="#collections" className="hover:text-[#C5A059] transition-colors">Chanderi Cotton</a></li>
              <li><a href="#collections" className="hover:text-[#C5A059] transition-colors">Organza Designer</a></li>
              <li><a href="#collections" className="hover:text-[#C5A059] transition-colors">Bridal Wear</a></li>
            </ul>
          </div>

          {/* Business Hours & Support */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-[#E8D39E]">Wholesale Support</h4>
            <ul className="space-y-2 text-sm text-[#FAF7F2]/70">
              <li>Mon - Sat: 9:30 AM - 7:30 PM</li>
              <li>Bulk Order Helpdesk</li>
              <li>Custom Catalogue Service</li>
              <li>GST Billing Assistance</li>
              <li>Export Compliance</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-bold text-[#E8D39E]">Contact Us</h4>
            <div className="space-y-2 text-sm text-[#FAF7F2]/70">
              <p>📍 Ring Road Textile Market, Surat, Gujarat 395002</p>
              <p>✉️ wholesale@rajwadasarees.com</p>
              <p>📞 +91 98765 43210 (B2B Desk)</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F2]/50 gap-4">
          <p>© {new Date().getFullYear()} Rajwada Sarees Wholesale. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#about" className="hover:text-[#C5A059]">Privacy Policy</a>
            <a href="#about" className="hover:text-[#C5A059]">Wholesale Terms</a>
            <a href="#about" className="hover:text-[#C5A059]">Shipping Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
