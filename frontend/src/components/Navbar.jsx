import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '#collections' },
    { name: 'Catalogue', path: '#catalogue' },
    { name: 'About Us', path: '#about' },
    { name: 'Contact', path: '#contact' },
    { name: 'Health Status', path: '/health' },
  ];

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(window.location.hash);
    };

    const handleScroll = () => {
      if (location.pathname !== '/') return;

      const sections = ['collections', 'catalogue', 'about', 'contact', 'enquiry'];
      const scrollPosition = window.scrollY + 120;

      let currentSection = '';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSection = `#${sectionId}`;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    handleScroll();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const isLinkActive = (linkPath) => {
    if (location.pathname === '/health' && linkPath === '/health') {
      return true;
    }
    if (location.pathname === '/') {
      if (linkPath === '/' && (!activeSection || activeSection === '')) {
        return true;
      }
      return activeSection === linkPath;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DAC8] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#6B1626] border border-[#C5A059] flex items-center justify-center text-[#E8D39E] font-serif text-lg sm:text-xl font-bold shadow-md group-hover:bg-[#4A0E19] transition-colors">
              R
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-wide text-[#4A0E19] uppercase leading-none">
                Rajwada <span className="text-[#C5A059]">Sarees</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-[#55504E] font-sans font-semibold mt-0.5">
                Wholesale &amp; Manufacturer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => {
                    if (link.path.startsWith('#')) {
                      setActiveSection(link.path);
                    }
                  }}
                  className={`relative py-1 text-xs lg:text-sm font-medium tracking-wide transition-colors ${
                    active
                      ? 'text-[#6B1626] font-semibold border-b-2 border-[#C5A059]'
                      : 'text-[#1F1C1D] hover:text-[#6B1626] hover:border-b-2 hover:border-[#C5A059]/50'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <a
              href="#enquiry"
              className="inline-flex items-center justify-center px-4 lg:px-5 py-2 sm:py-2.5 rounded-md bg-[#6B1626] hover:bg-[#4A0E19] text-[#FAF7F2] font-medium text-xs lg:text-sm tracking-wider uppercase border border-[#C5A059]/40 shadow-sm transition-all duration-200 active:scale-95"
            >
              Enquire Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-md text-[#4A0E19] hover:bg-[#F4EFE6] focus:outline-none touch-manipulation"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E5DAC8] px-4 pt-3 pb-6 space-y-2.5 shadow-xl animate-fadeIn">
          {navLinks.map((link) => {
            const active = isLinkActive(link.path);
            return (
              <a
                key={link.name}
                href={link.path}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (link.path.startsWith('#')) {
                    setActiveSection(link.path);
                  }
                }}
                className={`block px-3.5 py-2.5 rounded-md text-base font-medium transition-colors ${
                  active
                    ? 'text-[#6B1626] font-semibold bg-[#F4EFE6] border-l-4 border-[#C5A059]'
                    : 'text-[#1F1C1D] hover:text-[#6B1626] hover:bg-[#F4EFE6]'
                }`}
              >
                {link.name}
              </a>
            );
          })}
          <div className="pt-2">
            <a
              href="#enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full px-5 py-3 rounded-md bg-[#6B1626] text-[#FAF7F2] font-semibold text-sm tracking-wider uppercase shadow-md"
            >
              Enquire Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
