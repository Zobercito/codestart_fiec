import Link from "next/link";

export const metadata = { title: "Página no encontrada · CodeStart FIEC" };

/** 404 de toda la aplicación. */
export default function NoEncontrado() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-fiec-600">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
        Esta página no existe
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        Puede que el enlace esté mal escrito o que el contenido se haya movido.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fiec-500 focus-visible:ring-offset-2"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
