import type { Metadata } from "next";
import { FormularioAcceso } from "@/components/auth/formulario-acceso";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function PaginaAcceso() {
  return (
    <>
      <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Entra a tu cuenta</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
        Ingresa con tu correo institucional y la contraseña asignada.
      </p>

      <div className="mt-5">
        <FormularioAcceso />
      </div>
    </>
  );
}
