export default function EmptyState({
  title = 'No Sarees Found',
  description = 'Try adjusting your search keyword or clearing active filters to see more wholesale designs.',
  onReset
}) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center justify-center rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] px-4 py-10 text-center shadow-sm sm:my-8 sm:px-6 sm:py-16">
      <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#C5A059]/30 bg-[#6B1626]/10 text-2xl text-[#4A0E19] sm:h-16 sm:w-16 sm:text-3xl">
        🔍
      </div>

      <h3 className="mb-2 px-2 font-serif text-xl font-bold leading-tight text-[#4A0E19] sm:text-2xl">
        {title}
      </h3>

      <p className="mb-6 max-w-md px-2 text-sm leading-relaxed text-[#55504E]">
        {description}
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="min-h-11 w-full max-w-xs rounded border border-[#C5A059]/40 bg-[#6B1626] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] shadow-sm transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] sm:w-auto sm:px-6"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}