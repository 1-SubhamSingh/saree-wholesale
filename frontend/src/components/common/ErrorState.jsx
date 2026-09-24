import { Link } from 'react-router-dom';

export default function ErrorState({ title = 'Product Not Found', message = 'The requested saree catalogue or item could not be loaded.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#FAF7F2] border border-[#E5DAC8] rounded-xl text-center max-w-lg mx-auto my-12 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-2xl text-red-700 mb-4">
        ⚠️
      </div>
      <h3 className="font-serif text-2xl font-bold text-[#4A0E19] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#55504E] max-w-md leading-relaxed mb-6">
        {message}
      </p>
      <div className="flex items-center gap-4">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 rounded bg-[#6B1626] text-[#FAF7F2] font-semibold text-xs tracking-wider uppercase"
          >
            Try Again
          </button>
        )}
        <Link
          to="/catalogue"
          className="px-5 py-2.5 rounded bg-[#F4EFE6] text-[#4A0E19] border border-[#E5DAC8] font-semibold text-xs tracking-wider uppercase hover:bg-[#6B1626] hover:text-[#FAF7F2] transition-colors"
        >
          Back to Catalogue
        </Link>
      </div>
    </div>
  );
}
