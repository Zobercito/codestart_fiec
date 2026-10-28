/**
 * Tarjeta de un indicador del panel.
 *
 * El valor puede ser `null` cuando todavía no hay datos suficientes: se
 * muestra «—» y no un cero que parezca una medición real.
 */
export function Indicador({
  etiqueta,
  valor,
  detalle,
  tono = "fiec",
}: {
  etiqueta: string;
  valor: string | number | null;
  detalle: string;
  tono?: "fiec" | "coder" | "up" | "slate";
}) {
  const estilos = {
    fiec: "bg-fiec-50 text-fiec-900 ring-fiec-200",
    coder: "bg-emerald-50 text-emerald-900 ring-emerald-200",
    up: "bg-amber-50 text-amber-900 ring-amber-200",
    slate: "bg-slate-100 text-slate-800 ring-slate-200",
  }[tono];

  return (
    <article className={`rounded-2xl p-4 ring-1 ${estilos}`}>
      <p className="text-[10.5px] font-bold uppercase tracking-wider">
        {etiqueta}
      </p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight">
        {valor ?? "—"}
      </p>
      <p className="mt-1 text-[11.5px] leading-relaxed">{detalle}</p>
    </article>
  );
}
