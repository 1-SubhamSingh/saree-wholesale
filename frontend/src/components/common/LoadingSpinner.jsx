export default function LoadingSpinner({
  message = 'Loading catalogue collection...'
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="relative h-12 w-12 sm:h-14 sm:w-14">
        <div className="h-12 w-12 rounded-full border-4 border-[#E5DAC8] border-t-[#6B1626] animate-spin sm:h-14 sm:w-14" />

        <div className="absolute inset-0 flex items-center justify-center text-xs font-serif text-[#C5A059]">
          ✦
        </div>
      </div>

      <p className="mt-4 max-w-[90%] text-center font-serif text-sm leading-relaxed tracking-wide text-[#4A0E19] animate-pulse sm:text-base">
        {message}
      </p>
    </div>
  );
}