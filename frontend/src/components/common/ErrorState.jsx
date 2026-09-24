import { Link } from 'react-router-dom';

export default function ErrorState({
  title = 'Product Not Found',
  message = 'The requested saree catalogue or item could not be loaded.',
  onRetry
}) {
  return (
    <div className="mx-auto my-8 flex w-full max-w-lg flex-col items-center justify-center rounded-xl border border-[#E5DAC8] bg-[#FAF7F2] px-4 py-10 text-center shadow-sm sm:my-12 sm:px-6 sm:py-16">
      <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-100 text-2xl text-red-700 sm:h-16 sm:w-16">
        ⚠️
      </div>

      <h3 className="mb-2 px-2 font-serif text-xl font-bold leading-tight text-[#4A0E19] sm:text-2xl">
        {title}
      </h3>

      <p className="mb-6 max-w-md px-2 text-sm leading-relaxed text-[#55504E]">
        {message}
      </p>

      <div className="flex w-full max-w-xs flex-col items-stretch gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:gap-4">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 w-full rounded bg-[#6B1626] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FAF7F2] transition-colors hover:bg-[#4A0E19] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] sm:w-auto"
          >
            Try Again
          </button>
        )}

        <Link
          to="/catalogue"
          className="flex min-h-11 w-full items-center justify-center rounded border border-[#E5DAC8] bg-[#F4EFE6] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#4A0E19] transition-colors hover:bg-[#6B1626] hover:text-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:ring-offset-2 focus:ring-offset-[#FAF7F2] sm:w-auto"
        >
          Back to Catalogue
        </Link>
      </div>
    </div>
  );
}