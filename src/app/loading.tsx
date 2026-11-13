/** Estado de carga de la aplicación. */
export default function Cargando() {
  return (
    <main
      className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
        Cargando
      </p>
      <div className="mt-3 h-7 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </main>
  );
}
