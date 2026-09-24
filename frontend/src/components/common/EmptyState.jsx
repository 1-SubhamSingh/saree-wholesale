export default function EmptyState({ title = 'No Sarees Found', description = 'Try adjusting your search keyword or clearing active filters to see more wholesale designs.', onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#FAF7F2] border border-[#E5DAC8] rounded-xl text-center max-w-lg mx-auto my-8 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[#6B1626]/10 border border-[#C5A059]/30 flex items-center justify-center text-3xl mb-4 text-[#4A0E19]">
        🔍
      </div>
      <h3 className="font-serif text-2xl font-bold text-[#4A0E19] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#55504E] max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="px-6 py-2.5 rounded bg-[#6B1626] hover:bg-[#4A0E19] text-[#FAF7F2] font-semibold text-xs tracking-wider uppercase border border-[#C5A059]/40 transition-colors shadow-sm"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );
}
