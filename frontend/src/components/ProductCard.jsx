export default function ProductCard({ saree }) {
  return (
    <div className="group rounded-xl overflow-hidden border border-[#E5DAC8] bg-[#FAF7F2] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      
      {/* Product Image Placeholder Box */}
      <div className={`relative w-full h-64 ${saree.imageBg} p-6 flex flex-col justify-between overflow-hidden shadow-inner`}>
        
        {/* Subtle Decorative Backdrop Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:12px_12px]"></div>

        {/* Top Badges */}
        <div className="relative z-10 flex justify-between items-start">
          <span className="px-2.5 py-1 rounded bg-[#FAF7F2]/90 backdrop-blur-sm text-[#4A0E19] text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {saree.category}
          </span>
          <span className="px-2.5 py-1 rounded bg-[#6B1626] text-[#E8D39E] text-[10px] font-bold uppercase tracking-wider shadow-sm border border-[#C5A059]/40">
            {saree.badge}
          </span>
        </div>

        {/* Center Illustration Banner */}
        <div className="relative z-10 text-center my-auto">
          <div className="text-4xl mb-1 drop-shadow">🥻</div>
          <p className="text-[11px] font-mono text-[#E8D39E] tracking-widest uppercase opacity-90">
            {saree.sku}
          </p>
        </div>

        {/* Bottom Fabric Info Overlay */}
        <div className="relative z-10 flex justify-between items-center text-[11px] text-[#FAF7F2]/90 font-medium">
          <span>{saree.fabric}</span>
          <span className="text-[#E8D39E] font-semibold">{saree.minOrder}</span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-xs font-mono text-[#C5A059] uppercase tracking-wider mb-1">
            {saree.sku}
          </div>
          <h3 className="font-serif text-lg font-bold text-[#4A0E19] group-hover:text-[#6B1626] transition-colors leading-snug">
            {saree.name}
          </h3>
        </div>

        <div className="pt-3 border-t border-[#E5DAC8] flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase text-[#55504E] tracking-wider">Bulk Rate</p>
            <p className="font-sans font-bold text-sm text-[#6B1626]">{saree.priceTier}</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded bg-[#F4EFE6] hover:bg-[#6B1626] text-[#4A0E19] hover:text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider transition-colors border border-[#E5DAC8]"
          >
            View Details
          </button>
        </div>
      </div>

    </div>
  );
}
