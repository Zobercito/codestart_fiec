import type { Metadata } from "next";
import { FormularioRegistro } from "@/components/auth/formulario-registro";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function PaginaRegistro() {
  return (
    <>
      <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Crea tu cuenta</h1>
      <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
        Regístrate con tu correo institucional. Te enviaremos un correo para confirmar la cuenta
        antes de que puedas entrar.
      </p>

      <div className="mt-5">
        <FormularioRegistro />
      </div>
    </>
  );
}
