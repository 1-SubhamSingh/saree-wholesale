export default function CollectionCard({ collection }) {
  return (
    <div className="group flex min-w-0 flex-col justify-between overflow-hidden rounded-xl border border-[#E5DAC8] bg-[#F4EFE6] p-3 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
        <span className="shrink-0 text-2xl sm:text-3xl">
          {collection.symbol}
        </span>

        <span className="max-w-[65%] shrink-0 truncate rounded-full border border-[#6B1626]/20 bg-[#6B1626]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#6B1626] sm:max-w-none sm:px-2.5 sm:py-1 sm:text-xs">
          {collection.badge}
        </span>
      </div>

      <div
        className={`relative mb-4 flex h-28 w-full flex-col justify-between overflow-hidden rounded-lg ${collection.gradient} p-3 text-white shadow-inner sm:mb-6 sm:h-36 sm:p-4`}
      >
        <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-white/5 blur-xl sm:h-24 sm:w-24" />

        <div className="relative z-10 flex min-w-0 items-center justify-between gap-2 text-[9px] text-[#E8D39E] sm:text-xs">
          <span className="min-w-0 truncate font-mono uppercase tracking-widest">
            {collection.id}
          </span>
          <span className="shrink-0">{collection.itemCount}</span>
        </div>

        <div className="relative z-10 line-clamp-2 font-serif text-sm font-bold leading-tight text-[#FAF7F2] sm:text-lg">
          {collection.title}
        </div>
      </div>

      <div className="min-w-0 space-y-2 sm:space-y-3">
        <h3 className="break-words font-serif text-lg font-bold leading-tight text-[#4A0E19] transition-colors group-hover:text-[#6B1626] sm:text-xl">
          {collection.title}
        </h3>

        <p className="break-words text-xs leading-relaxed text-[#55504E] sm:text-sm">
          {collection.description}
        </p>
      </div>

      <div className="mt-3 flex min-w-0 items-center justify-between gap-3 border-t border-[#E5DAC8] pt-3 text-xs font-semibold text-[#6B1626] transition-colors group-hover:text-[#4A0E19] sm:mt-4 sm:pt-4">
        <span className="min-w-0 truncate">Browse Catalogue</span>

        <span className="shrink-0 transform transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </div>
  );
}