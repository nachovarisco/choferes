export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg bg-white shadow-sm" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />
    </div>
  );
}
