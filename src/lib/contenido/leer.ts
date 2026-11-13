import "server-only";

import { readFile } from "node:fs/promises";
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

/**
 * El texto MDX de la ruta que guarda la base de datos.
 *
 * Las lecciones guardan la ruta del archivo, por ejemplo
 * "lecciones/m03-l1-que-pasa-al-ejecutar.mdx". Se valida que la ruta
 * resuelva dentro del directorio de contenido, para que un valor
 * manipulado no pueda leer cualquier archivo del servidor.
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
