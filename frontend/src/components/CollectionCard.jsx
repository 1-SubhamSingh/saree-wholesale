export default function CollectionCard({ collection }) {
  return (
    <div className="group relative rounded-xl overflow-hidden border border-[#E5DAC8] bg-[#F4EFE6] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6">
      
      {/* Top Header & Badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-3xl">{collection.symbol}</span>
        <span className="px-2.5 py-1 rounded-full bg-[#6B1626]/10 text-[#6B1626] text-xs font-semibold tracking-wider uppercase border border-[#6B1626]/20">
          {collection.badge}
        </span>
      </div>

      {/* Visual Placeholder Graphic Box */}
      <div className={`w-full h-36 rounded-lg ${collection.gradient} p-4 flex flex-col justify-between text-white relative overflow-hidden mb-6 shadow-inner`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex justify-between items-center text-xs text-[#E8D39E]">
          <span className="font-mono uppercase tracking-widest">{collection.id}</span>
          <span>{collection.itemCount}</span>
        </div>
        <div className="relative z-10 font-serif text-lg font-bold text-[#FAF7F2]">
          {collection.title}
        </div>
      </div>

      {/* Card Content */}
      <div className="space-y-3">
        <h3 className="font-serif text-xl font-bold text-[#4A0E19] group-hover:text-[#6B1626] transition-colors">
          {collection.title}
        </h3>
        <p className="text-sm text-[#55504E] leading-relaxed">
          {collection.description}
        </p>
      </div>

      {/* Action link */}
      <div className="pt-4 mt-2 border-t border-[#E5DAC8] flex items-center justify-between text-xs font-semibold text-[#6B1626] group-hover:text-[#4A0E19]">
        <span>Browse Catalogue</span>
        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </div>
  );
}
