export default function LoadingSpinner({ fullscreen = false, label = 'Loading...' }) {
  const containerClass = fullscreen
    ? 'fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm'
    : 'flex min-h-[240px] items-center justify-center';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600/25 border-t-blue-600" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}
