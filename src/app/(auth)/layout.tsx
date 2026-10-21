import { Marca } from "@/components/layout/marca";

export default function LayoutAcceso({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Marca />
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {children}
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
          CodeStart FIEC — Universidad de Panamá, Facultad de Informática, Electrónica y
          Comunicación.
          <br />
          Material de apoyo del curso propedéutico.
        </p>
      </div>
    </main>
  );
}
