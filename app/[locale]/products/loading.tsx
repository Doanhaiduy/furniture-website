export default function ProductsLoading() {
  return (
    <main className="animate-pulse">
      <section className="container-pd public-page-header grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <div className="h-4 w-32 rounded bg-surface-container-high" />
          <div className="mt-6 h-12 w-2/3 rounded bg-surface-container-high" />
          <div className="mt-6 h-6 w-full rounded bg-surface-container-high" />
        </div>
        <div className="h-72 w-full rounded-lg bg-surface-container-high lg:h-80" />
      </section>

      <section className="container-pd pb-20">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-lg bg-surface-container-high" />
          ))}
        </div>

        <div className="mb-6 h-12 w-full rounded bg-surface-container-high" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[4/5] w-full rounded-lg bg-surface-container-high" />
              <div className="h-6 w-3/4 rounded bg-surface-container-high" />
              <div className="h-4 w-1/2 rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
