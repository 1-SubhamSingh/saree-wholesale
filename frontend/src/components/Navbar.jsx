import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  const isManualClickingRef = useRef(false);
  const clickTimerRef = useRef(null);

  const navLinks = [
    { id: 'home', name: 'Home', path: '/' },
    { id: 'catalogue', name: 'Catalogue', path: '/catalogue' },
    { id: 'collections', name: 'Collections', path: '#collections' },
    { id: 'about', name: 'About Us', path: '#about' },
    { id: 'contact', name: 'Contact', path: '#contact' },
    { id: 'health', name: 'Health Status', path: '/health' },
  ];

  const setManualActiveSection = (sectionId) => {
    setActiveSection(sectionId);
    isManualClickingRef.current = true;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      isManualClickingRef.current = false;
    }, 1000);
  };

  // Scroll position listener for Home page active section highlight
  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      if (isManualClickingRef.current) return;

      const scrollPosition = window.scrollY + 160;
      const sections = ['collections', 'catalogue', 'about', 'contact'];

      let current = 'home';
      if (window.scrollY < 200) {
        current = 'home';
      } else {
        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              current = sectionId;
              break;
            }
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Handle hash scrolling when arriving from external pages
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          setManualActiveSection(targetId);
        }, 100);
      }
    }
  }, [location]);

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (link.path === '/') {
      if (location.pathname === '/') {
        setManualActiveSection('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
      return;
    }

    if (link.path.startsWith('/') && !link.path.includes('#')) {
      navigate(link.path);
      return;
    }

    if (link.path.startsWith('#')) {
      const sectionId = link.path.replace('#', '');
      if (location.pathname === '/') {
        setManualActiveSection(sectionId);
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/${link.path}`);
      }
    }
  };

  const isLinkActive = (link) => {
    if (location.pathname === '/catalogue' && link.id === 'catalogue') return true;
    if (location.pathname === '/health' && link.id === 'health') return true;
    if (location.pathname === '/') {
      return activeSection === link.id;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DAC8] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={(e) => handleLinkClick(e, { id: 'home', path: '/' })}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
          >
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
              const active = isLinkActive(link);
              return (
                <a
                  key={link.id}
                  href={link.path}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`relative py-1 text-xs lg:text-sm font-medium tracking-wide transition-all ${
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
            <Link
              to="/enquiry"
              className="inline-flex items-center justify-center px-4 lg:px-5 py-2 sm:py-2.5 rounded-md bg-[#6B1626] hover:bg-[#4A0E19] text-[#FAF7F2] font-medium text-xs lg:text-sm tracking-wider uppercase border border-[#C5A059]/40 shadow-sm transition-all duration-200 active:scale-95"
            >
              Enquire Now
            </Link>
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
            const active = isLinkActive(link);
            return (
              <a
                key={link.id}
                href={link.path}
                onClick={(e) => handleLinkClick(e, link)}
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
            <Link
              to="/enquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center w-full px-5 py-3 rounded-md bg-[#6B1626] text-[#FAF7F2] font-semibold text-sm tracking-wider uppercase shadow-md"
            >
              Enquire Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
