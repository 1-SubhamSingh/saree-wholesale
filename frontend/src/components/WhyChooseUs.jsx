import { WHY_CHOOSE_US } from '../data/mockData';

export default function WhyChooseUs() {
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'factory':
        return (
          <svg
            className="h-5 w-5 text-[#C5A059] sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );

      case 'grid':
        return (
          <svg
            className="h-5 w-5 text-[#C5A059] sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        );

      case 'shield':
        return (
          <svg
            className="h-5 w-5 text-[#C5A059] sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        );

      case 'truck':
      default:
        return (
          <svg
            className="h-5 w-5 text-[#C5A059] sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <section
      id="about"
      className="border-y border-[#E5DAC8] bg-[#F4EFE6] py-12 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl space-y-3 text-center sm:mb-16 sm:space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C5A059] sm:text-xs sm:tracking-widest">
            The Rajwada Advantage
          </p>

          <h2 className="font-serif text-2xl font-bold leading-tight text-[#4A0E19] sm:text-4xl">
            Why Wholesale Buyers Partner With Us
          </h2>

          <div className="mx-auto h-0.5 w-12 bg-[#C5A059] sm:w-16" />

          <p className="px-1 text-sm leading-relaxed text-[#55504E] sm:px-0 sm:text-base">
            We empower saree retailers, boutique owners, and global distributors
            with unmatched quality, pricing transparency, and reliable
            fulfillment.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {WHY_CHOOSE_US.map((item) => (
            <div
              key={item.id}
              className="flex min-w-0 flex-col items-center space-y-3 rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] p-5 text-center shadow-sm transition-shadow hover:shadow-md sm:space-y-4 sm:p-8"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#C5A059]/30 bg-[#6B1626]/10 sm:h-14 sm:w-14">
                {renderIcon(item.icon)}
              </div>

              <h3 className="break-words font-serif text-lg font-bold leading-tight text-[#4A0E19] sm:text-xl">
                {item.title}
              </h3>

              <p className="break-words text-xs leading-relaxed text-[#55504E] sm:text-sm">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}