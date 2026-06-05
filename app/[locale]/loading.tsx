export default function Loading() {
  return (
    <main className="container-pd py-16">
      <div className="space-y-6">
        <div className="skeleton-pd h-8 w-52" />
        <div className="skeleton-pd h-16 max-w-3xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="skeleton-pd h-52" />
          <div className="skeleton-pd h-52" />
          <div className="skeleton-pd h-52" />
        </div>
      </div>
    </main>
  );
}
