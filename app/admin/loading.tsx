export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="space-y-6">
        <div className="skeleton-pd h-12 w-80" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton-pd h-32" />
          ))}
        </div>
        <div className="skeleton-pd h-96" />
      </div>
    </main>
  );
}
