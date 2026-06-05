export default function ProductsLoading() {
  return (
    <main className="container-pd grid gap-8 py-14 lg:grid-cols-[260px_1fr]">
      <div className="skeleton-pd h-96" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="skeleton-pd h-72" />
        ))}
      </div>
    </main>
  );
}
