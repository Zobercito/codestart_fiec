import type { InputHTMLAttributes } from "react";

type PropsCampo = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  error?: string;
  ayuda?: string;
};

/**
 * Campo de formulario.
 *
 * El foco se ve con un anillo de fiec-500: el mockup no tiene
 * formularios, pero el sistema es el mismo (radio-xl, borde slate-300,
 * tipografia Inter) y el RNF06 pide foco visible.
 */
export function Campo({ etiqueta, error, ayuda, id, ...props }: PropsCampo) {
  const idCampo = id ?? props.name;

  return (
    <div>
      <label htmlFor={idCampo} className="block text-[12.5px] font-semibold text-slate-700">
        {etiqueta}
      </label>
      <input
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${idCampo}-error` : ayuda ? `${idCampo}-ayuda` : undefined}
        className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:border-red-600 focus:ring-red-600/25"
            : "border-slate-300 focus:border-fiec-500 focus:ring-fiec-500/25"
        }`}
        {...props}
      />
      {error ? (
        <p id={`${idCampo}-error`} className="mt-1.5 text-[12px] font-medium text-red-700">
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${idCampo}-ayuda`} className="mt-1.5 text-[12px] text-slate-500">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}
