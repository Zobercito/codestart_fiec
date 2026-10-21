import type { MDXComponents } from "mdx/types";
import { BloqueCodigo } from "@/components/leccion/bloque-codigo";
import { RecorridoInstruccion } from "@/components/leccion/recorrido-instruccion";
import { SimuladorMemoria } from "@/components/leccion/simulador-memoria";
import { VisorAnatomia } from "@/components/leccion/visor-anatomia";

/**
 * Componentes que una leccion en MDX puede usar.
 *
 * El contenido esta versionado en el repositorio (seccion 15.1 del
 * Avance 1), asi que la lista de lo que se puede incrustar es
 * cerrada: si algo no esta aqui, no se puede escribir en una leccion.
 */

export const COMPONENTES_MDX: MDXComponents = {
  VisorAnatomia,
  SimuladorMemoria,
  RecorridoInstruccion,

  // Bloque de codigo: en markdown normal se sustituye por este.
  pre: ({ children }) => {
    const texto = extraerCodigo(children);
    return <BloqueCodigo codigo={texto} />;
  },
  code: ({ children, className }) => {
    const texto = String(children ?? "");
    const esBloque = className?.startsWith("language-");
    if (!esBloque) {
      return (
        <code className="mono rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-800">
          {texto}
        </code>
      );
    }
    return <BloqueCodigo codigo={texto} lenguaje={className.replace("language-", "")} />;
  },
};

/** Saca el texto plano de los hijos que MDX pasa al elemento pre. */
function extraerCodigo(children: unknown): string {
  const recorrer = (nodo: unknown): string => {
    if (typeof nodo === "string") return nodo;
    if (Array.isArray(nodo)) return nodo.map(recorrer).join("");
    if (nodo && typeof nodo === "object" && "props" in nodo) {
      const props = (nodo as { props?: { children?: unknown } }).props;
      return props?.children ? recorrer(props.children) : "";
    }
    return "";
  };
  return recorrer(children);
}
