export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero section skeleton */}
      <section className="mx-auto max-w-4xl space-y-4 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-3/4 animate-pulse rounded-lg bg-muted" />
          <div className="h-6 w-2/3 animate-pulse rounded-lg bg-muted" />
        </div>
      </section>

      {/* Search section skeleton */}
      <section className="mx-auto mt-12 max-w-xl">
        <div className="overflow-hidden rounded-xl border border-primary/20 p-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted mx-auto mb-4" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </section>

      {/* Featured articles skeleton */}
      <section className="mt-16">
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded-lg bg-muted" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border bg-background">
                <div className="aspect-video animate-pulse bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-6 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}