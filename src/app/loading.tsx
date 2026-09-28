export default function Loading() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
          <div className="h-3 w-36 rounded-full bg-muted" />
          <div className="mt-3 h-8 w-48 rounded-full bg-muted" />
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-6">
        <div className="h-80 rounded-3xl bg-muted" />
        <div className="h-64 rounded-3xl bg-muted" />
      </div>
    </main>
  );
}
