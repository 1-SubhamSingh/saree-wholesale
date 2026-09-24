import { Link } from 'react-router-dom';

export default function ProductCard({ saree }) {
  return (
    <div className="group flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] shadow-sm transition-all duration-300 hover:shadow-xl">
      <Link
        to={`/product/${saree.id}`}
        className="relative block h-48 w-full overflow-hidden shadow-inner sm:h-64"
      >
        <div
          className={`relative flex h-full w-full flex-col justify-between overflow-hidden ${saree.imageBg} p-3 transition-transform duration-500 group-hover:scale-105 sm:p-6`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] opacity-10 [background-size:12px_12px]" />

          <div className="relative z-10 flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 max-w-[65%] truncate rounded bg-[#FAF7F2]/90 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#4A0E19] shadow-sm backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[10px]">
              {saree.category}
            </span>

            <span className="max-w-[40%] shrink-0 truncate rounded border border-[#C5A059]/40 bg-[#6B1626] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#E8D39E] shadow-sm sm:px-2.5 sm:py-1 sm:text-[10px]">
              {saree.badge}
            </span>
          </div>

          <div className="relative z-10 my-auto text-center">
            <div className="mb-1 transform text-3xl drop-shadow transition-transform group-hover:scale-110 sm:text-4xl">
              🥻
            </div>

            <p className="truncate px-2 font-mono text-[9px] uppercase tracking-widest text-[#E8D39E] opacity-90 sm:text-[11px]">
              {saree.sku}
            </p>
          </div>

          <div className="relative z-10 flex min-w-0 items-center justify-between gap-2 text-[9px] font-medium text-[#FAF7F2]/90 sm:text-[11px]">
            <span className="min-w-0 truncate">{saree.fabric}</span>
            <span className="shrink-0 font-semibold text-[#E8D39E]">
              {saree.minOrder}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between space-y-3 p-3 sm:p-6">
        <div className="min-w-0">
          <div className="mb-1 truncate font-mono text-[9px] uppercase tracking-wider text-[#C5A059] sm:text-xs">
            {saree.sku}
          </div>

          <Link to={`/product/${saree.id}`}>
            <h3 className="break-words font-serif text-base font-bold leading-snug text-[#4A0E19] transition-colors group-hover:text-[#6B1626] sm:text-lg">
              {saree.name}
            </h3>
          </Link>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-2 border-t border-[#E5DAC8] pt-3">
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wider text-[#55504E] sm:text-[10px]">
              Bulk Rate
            </p>

            <p className="truncate font-sans text-xs font-bold text-[#6B1626] sm:text-sm">
              {saree.priceTier}
            </p>
          </div>

          <Link
            to={`/product/${saree.id}`}
            className="inline-flex min-h-10 shrink-0 items-center justify-center whitespace-nowrap rounded border border-[#E5DAC8] bg-[#F4EFE6] px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-[#4A0E19] transition-colors hover:bg-[#6B1626] hover:text-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] sm:px-4 sm:text-xs"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}