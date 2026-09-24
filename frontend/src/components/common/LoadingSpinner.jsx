export default function LoadingSpinner({ message = 'Loading catalogue collection...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative w-14 h-14">
        <div className="w-14 h-14 rounded-full border-4 border-[#E5DAC8] border-t-[#6B1626] animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-[#C5A059] text-xs font-serif">
          ✦
        </div>
      </div>
      <p className="mt-4 font-serif text-base text-[#4A0E19] tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
