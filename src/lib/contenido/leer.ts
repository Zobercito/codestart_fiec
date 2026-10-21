import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/**
 * Lectura del contenido de las lecciones.
 *
 * El contenido vive como MDX en el repositorio (seccion 15.1 del
 * Avance 1): se versiona, se revisa con el mismo pull request que el
 * codigo, y no necesita una tabla en la base de datos.
 *
 * El contenido NO va con "use cache". La clave de esa cache es la
 * ruta, asi que al editar un .mdx se seguiria sirviendo la version
 * vieja: se comprobo que el cambio no aparecia hasta reiniciar el
 * servidor. El contenido se lee siempre del disco, que es lo rapido,
 * y las rutas que lo usan se renderizan en request-time
 * (export const instant = false).
 */

const RAIZ_CONTENIDO = path.join(process.cwd(), "src", "content");

export type TipoContenido = "modulo" | "leccion";

async function listarNombres(carpeta: string): Promise<string[]> {
  try {
    const entradas = await readdir(path.join(RAIZ_CONTENIDO, carpeta), {
      withFileTypes: true,
    });
    return entradas
      .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
      .map((e) => e.name.replace(/\.mdx$/, ""))
      .sort();
  } catch {
    return [];
  }
}

export async function listarModulos(): Promise<string[]> {
  return listarNombres("modulos");
}

export async function listarLecciones(): Promise<string[]> {
  return listarNombres("lecciones");
}

/** El texto MDX de un modulo o de una leccion. */
export async function leerContenido(
  tipo: TipoContenido,
  slug: string,
): Promise<string | null> {
  // El slug viene de la ruta: solo se admiten nombres de archivo
  // seguros, para que nadie pueda leer fuera del directorio de contenido.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const carpeta = tipo === "modulo" ? "modulos" : "lecciones";
  try {
    return await readFile(path.join(RAIZ_CONTENIDO, carpeta, `${slug}.mdx`), "utf8");
  } catch {
    return null;
  }
}

/**
 * El texto MDX de la ruta que guarda la base de datos.
 *
 * La tabla modulos y lecciones guardan la ruta del archivo, por ejemplo
 * "contenido/lecciones/m03-l1-que-pasa-al-ejecutar.mdx". Se valida que
 * la ruta resuelva dentro del directorio de contenido, para que un
 * valor manipulado no pueda leer cualquier archivo del servidor.
 */
export async function leerContenidoPorRuta(ruta: string): Promise<string | null> {
  const absoluta = path.resolve(RAIZ_CONTENIDO, ruta);
  if (!absoluta.startsWith(RAIZ_CONTENIDO + path.sep)) return null;
  if (!absoluta.endsWith(".mdx")) return null;
  try {
    return await readFile(absoluta, "utf8");
  } catch {
    return null;
  }
}

/** El titulo de un archivo MDX, para las listas y las migas de pan. */
export async function leerTitulo(
  tipo: TipoContenido,
  slug: string,
): Promise<string | null> {
  const fuente = await leerContenido(tipo, slug);
  if (!fuente) return null;
  const coincidencia = fuente.match(/^#\s+(.+)$/m);
  return coincidencia ? coincidencia[1].trim() : null;
}
