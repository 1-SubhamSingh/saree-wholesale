import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-[#C5A059]/30 bg-[#1F1C1D] pb-6 pt-10 text-[#FAF7F2] sm:pb-12 sm:pt-16"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 border-b border-[#55504E]/40 pb-10 sm:grid-cols-2 sm:gap-10 sm:pb-12 lg:grid-cols-5">
          <div className="min-w-0 space-y-4 sm:col-span-2 lg:col-span-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C5A059] bg-[#6B1626] font-serif text-lg font-bold text-[#E8D39E]">
                R
              </div>

              <span className="min-w-0 break-words font-serif text-xl font-bold uppercase tracking-wide text-[#FAF7F2] sm:text-2xl">
                Rajwada <span className="text-[#C5A059]">Sarees</span>
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-[#FAF7F2]/70">
              Premier manufacturer &amp; wholesale exporter of authentic Indian
              sarees. Specializing in Kanjivaram, Banarasi, Chanderi, and
              contemporary designer collections.
            </p>

            <div className="text-xs font-medium uppercase tracking-wider text-[#C5A059]">
              ✦ Surat &amp; Kanchipuram Weaving Hubs
            </div>
          </div>

          <div className="min-w-0 space-y-3">
            <h4 className="font-serif text-base font-bold text-[#E8D39E] sm:text-lg">
              Categories
            </h4>

            <ul className="space-y-2 text-sm text-[#FAF7F2]/70">
              <li>
                <a href="#collections" className="transition-colors hover:text-[#C5A059]">
                  Silk Sarees
                </a>
              </li>
              <li>
                <a href="#collections" className="transition-colors hover:text-[#C5A059]">
                  Banarasi Brocade
                </a>
              </li>
              <li>
                <a href="#collections" className="transition-colors hover:text-[#C5A059]">
                  Chanderi Cotton
                </a>
              </li>
              <li>
                <a href="#collections" className="transition-colors hover:text-[#C5A059]">
                  Organza Designer
                </a>
              </li>
              <li>
                <a href="#collections" className="transition-colors hover:text-[#C5A059]">
                  Bridal Wear
                </a>
              </li>
            </ul>
          </div>

          <div className="min-w-0 space-y-3">
            <h4 className="font-serif text-base font-bold text-[#E8D39E] sm:text-lg">
              Wholesale Support
            </h4>

            <ul className="space-y-2 text-sm leading-relaxed text-[#FAF7F2]/70">
              <li>Mon – Sat: 9:30 AM – 7:30 PM</li>
              <li>Bulk Order Helpdesk</li>
              <li>Custom Catalogue Service</li>
              <li>GST Billing Assistance</li>
              <li>Export Compliance</li>
            </ul>
          </div>

          <div className="min-w-0 space-y-3">
            <h4 className="font-serif text-base font-bold text-[#E8D39E] sm:text-lg">
              Contact Us
            </h4>

            <div className="space-y-2 text-sm leading-relaxed text-[#FAF7F2]/70">
              <p className="break-words">
                📍 Ring Road Textile Market, Surat, Gujarat 395002
              </p>

              <p className="break-all">
                ✉️ wholesale@rajwadasarees.com
              </p>

              <p className="break-words">
                📞 +91 98765 43210 (B2B Desk)
              </p>
            </div>

            <Link
              to="/enquiry"
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[#C5A059]/40 bg-[#6B1626] px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#1F1C1D] sm:w-auto"
            >
              Send Enquiry ✉️
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-center text-xs text-[#FAF7F2]/50 sm:pt-8 lg:flex-row lg:text-left">
          <p className="max-w-full break-words">
            © {new Date().getFullYear()} Rajwada Sarees Wholesale. All rights
            reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6">
            <a href="#about" className="transition-colors hover:text-[#C5A059]">
              Privacy Policy
            </a>
            <a href="#about" className="transition-colors hover:text-[#C5A059]">
              Wholesale Terms
            </a>
            <a href="#about" className="transition-colors hover:text-[#C5A059]">
              Shipping Policy
            </a>
            <Link to="/admin/login" className="transition-colors text-[#C5A059]/80 hover:text-[#E8D39E]">
              Admin Portal 🔒
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}