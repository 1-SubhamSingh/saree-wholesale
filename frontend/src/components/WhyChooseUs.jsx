import { WHY_CHOOSE_US } from '../data/mockData';

export default function WhyChooseUs() {
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'factory':
        return (
          <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'grid':
        return (
          <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'truck':
      default:
        return (
          <svg className="w-6 h-6 text-[#C5A059]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#F4EFE6] border-y border-[#E5DAC8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C5A059]">
            The Rajwada Advantage
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A0E19]">
            Why Wholesale Buyers Partner With Us
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto"></div>
          <p className="text-base text-[#55504E]">
            We empower saree retailers, boutique owners, and global distributors with unmatched quality, pricing transparency, and reliable fulfillment.
          </p>
        </div>

        {/* 4 Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {WHY_CHOOSE_US.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF7F2] rounded-xl p-8 border border-[#E5DAC8] shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-[#6B1626]/10 border border-[#C5A059]/30 flex items-center justify-center">
                {renderIcon(item.icon)}
              </div>
              <h3 className="font-serif text-xl font-bold text-[#4A0E19]">
                {item.title}
              </h3>
              <p className="text-sm text-[#55504E] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
