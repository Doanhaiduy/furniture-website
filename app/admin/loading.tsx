export default function AdminLoading() {
  return (
    <div className="min-w-0 flex-1 px-4 py-4 text-sm md:px-5 xl:px-6">
      <div className="space-y-6">
        {/* Page header skeleton */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-3">
            <div className="skeleton-pd h-5 w-28 rounded-full" />
            <div className="skeleton-pd h-8 w-72" />
            <div className="skeleton-pd h-4 w-96" />
          </div>
          <div className="skeleton-pd h-10 w-36" />
        </div>
        {/* Content cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-pd h-28 rounded-xl" />
          ))}
        </div>
        <div className="skeleton-pd h-96 rounded-xl" />
        <div className="skeleton-pd h-64 rounded-xl" />
      </div>
    </div>
  );
}
