interface GlobalAppLoaderProps {
  isVisible?: boolean;
}

export default function GlobalAppLoader({ isVisible = true }: GlobalAppLoaderProps) {
  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#f7f8fb] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-live="polite"
      aria-busy={isVisible}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <div className="text-4xl font-black tracking-tight text-black sm:text-5xl">Only If</div>
        <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.32em] text-gray-400">
          Premium Estates
        </div>
        <div className="mt-8 h-1 w-44 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 animate-[onlyif-loader_1.1s_ease-in-out_infinite] rounded-full bg-black" />
        </div>
      </div>
    </div>
  );
}
