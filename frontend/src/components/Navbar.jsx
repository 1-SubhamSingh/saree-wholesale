import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolledSection, setScrolledSection] = useState('home');

  const location = useLocation();
  const navigate = useNavigate();

  const isManualRef = useRef(false);
  const manualTimerRef = useRef(null);

  const navLinks = [
    { id: 'home', name: 'Home', path: '/', type: 'route' },
    { id: 'catalogue', name: 'Catalogue', path: '/catalogue', type: 'route' },
    { id: 'collections', name: 'Collections', path: '#collections', type: 'hash' },
    { id: 'about', name: 'About Us', path: '#about', type: 'hash' },
    { id: 'contact', name: 'Contact', path: '#contact', type: 'hash' }
  ];

  const getActiveId = () => {
    const path = location.pathname;

    if (path === '/catalogue') return 'catalogue';
    if (path.startsWith('/product')) return 'catalogue';
    if (path === '/enquiry') return '';
    if (path === '/health') return '';
    if (path === '/') return scrolledSection;

    return '';
  };

  const activeId = getActiveId();

  useEffect(() => {
    if (location.pathname !== '/') return;

    const handleScroll = () => {
      if (isManualRef.current) return;

      const scrollY = window.scrollY;

      if (
        Math.ceil(window.innerHeight + scrollY) >=
        document.documentElement.scrollHeight - 50
      ) {
        setScrolledSection('contact');
        return;
      }

      const sections = ['contact', 'about', 'collections', 'home'];

      for (const sid of sections) {
        const el = document.getElementById(sid);

        if (el) {
          const rect = el.getBoundingClientRect();

          if (rect.top <= window.innerHeight / 2) {
            setScrolledSection(sid);
            return;
          }
        }
      }

      setScrolledSection('home');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '');

      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);

        if (el) {
          const navbarHeight =
            window.innerWidth >= 640 ? 80 : 56;

          const top =
            el.getBoundingClientRect().top +
            window.scrollY -
            navbarHeight;

          window.scrollTo({
            top,
            behavior: 'smooth'
          });
        }

        isManualRef.current = true;
        setScrolledSection(targetId);

        if (manualTimerRef.current) {
          clearTimeout(manualTimerRef.current);
        }

        manualTimerRef.current = setTimeout(() => {
          isManualRef.current = false;
        }, 1200);
      }, 80);

      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    return () => {
      if (manualTimerRef.current) {
        clearTimeout(manualTimerRef.current);
      }
    };
  }, []);

  const handleLinkClick = (e, link) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (link.type === 'route') {
      if (link.path === '/' && location.pathname === '/') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        isManualRef.current = true;
        setScrolledSection('home');

        if (manualTimerRef.current) {
          clearTimeout(manualTimerRef.current);
        }

        manualTimerRef.current = setTimeout(() => {
          isManualRef.current = false;
        }, 800);
      } else {
        navigate(link.path);
      }

      return;
    }

    const sectionId = link.path.replace('#', '');

    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);

      if (el) {
        const navbarHeight =
          window.innerWidth >= 640 ? 80 : 56;

        const top =
          el.getBoundingClientRect().top +
          window.scrollY -
          navbarHeight;

        window.scrollTo({
          top,
          behavior: 'smooth'
        });

        isManualRef.current = true;
        setScrolledSection(sectionId);

        if (manualTimerRef.current) {
          clearTimeout(manualTimerRef.current);
        }

        manualTimerRef.current = setTimeout(() => {
          isManualRef.current = false;
        }, 1200);
      }
    } else {
      navigate(`/${link.path}`);
    }
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-[#E5DAC8] bg-[#FAF7F2]/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex min-h-14 items-center justify-between gap-2 sm:min-h-20">
            <Link
              to="/"
              onClick={(e) =>
                handleLinkClick(e, {
                  id: 'home',
                  path: '/',
                  type: 'route'
                })
              }
              className="group flex min-w-0 shrink items-center gap-2 sm:gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#C5A059] bg-[#6B1626] font-serif text-lg font-bold text-[#E8D39E] shadow-md transition-colors group-hover:bg-[#4A0E19] sm:h-10 sm:w-10 sm:text-xl">
                R
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="truncate font-serif text-sm font-bold uppercase leading-none tracking-wide text-[#4A0E19] sm:text-2xl">
                  Rajwada <span className="text-[#C5A059]">Sarees</span>
                </span>

                <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-widest text-[#55504E] sm:block">
                  Wholesale &amp; Manufacturer
                </span>
              </div>
            </Link>

            <nav className="hidden items-center space-x-1 md:flex lg:space-x-2">
              {navLinks.map((link) => {
                const isActive = activeId === link.id;

                return (
                  <a
                    key={link.id}
                    href={link.path}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={[
                      'relative whitespace-nowrap rounded-sm px-3 py-2 text-xs font-medium tracking-wide transition-colors duration-200 lg:px-4 lg:text-sm',
                      isActive
                        ? 'font-semibold text-[#6B1626]'
                        : 'text-[#1F1C1D] hover:text-[#6B1626]'
                    ].join(' ')}
                  >
                    {link.name}

                    <span
                      className={[
                        'absolute bottom-0 left-0 right-0 h-0.5 origin-center rounded-full bg-[#C5A059] transition-all duration-300',
                        isActive
                          ? 'scale-x-100 opacity-100'
                          : 'scale-x-0 opacity-0'
                      ].join(' ')}
                    />
                  </a>
                );
              })}
            </nav>

            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <Link
                to="/enquiry"
                className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-[#C5A059]/40 bg-[#6B1626] px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#FAF7F2] shadow-sm transition-all duration-200 hover:bg-[#4A0E19] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
              >
                Enquire Now
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 md:hidden">
              <Link
                to="/enquiry"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded border border-[#C5A059]/40 bg-[#6B1626] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
              >
                Enquire
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-md text-[#4A0E19] transition-colors hover:bg-[#F4EFE6] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#E5DAC8] bg-[#FAF7F2] shadow-lg md:hidden">
            <nav className="space-y-1 px-4 py-3">
              {navLinks.map((link) => {
                const isActive = activeId === link.id;

                return (
                  <a
                    key={link.id}
                    href={link.path}
                    onClick={(e) => handleLinkClick(e, link)}
                    className={[
                      'flex min-h-11 items-center rounded-lg border-l-4 px-4 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-[#C5A059] bg-[#6B1626]/10 font-semibold text-[#6B1626]'
                        : 'border-transparent text-[#1F1C1D] hover:bg-[#F4EFE6] hover:text-[#6B1626]'
                    ].join(' ')}
                  >
                    {link.name}
                  </a>
                );
              })}

              <div className="pt-3">
                <Link
                  to="/enquiry"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-11 w-full items-center justify-center rounded-lg bg-[#6B1626] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-md transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2"
                >
                  Send Wholesale Enquiry
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div
        aria-hidden="true"
        className="h-14 shrink-0 sm:h-20"
      />
    </>
  );
}