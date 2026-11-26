export default function Loading() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16" aria-busy="true">
      <div className="h-8 w-2/3 animate-pulse bg-muted" />
      <div className="mt-6 h-4 w-full animate-pulse bg-muted" />
      <div className="mt-3 h-4 w-5/6 animate-pulse bg-muted" />
    </section>
  )
}
