/**
 * Límite de peticiones en memoria, por proceso.
 *
 * No sustituye a un rate limit distribuido (Vercel puede tener varias
 * instancias), pero frena el bucle accidental o el script que martillea
 * `/verificar`. La ventana es fija y se limpia al superar 5.000 claves.
 */
type Cubo = { inicio: number; cuenta: number };

const cubos = new Map<string, Cubo>();

export function consumirLimite(
  clave: string,
  maximo = 30,
  ventanaMs = 60_000,
): boolean {
  const ahora = Date.now();
  const actual = cubos.get(clave);

  if (!actual || ahora - actual.inicio >= ventanaMs) {
    if (cubos.size > 5_000) {
      for (const [k, c] of cubos) {
        if (ahora - c.inicio >= ventanaMs) cubos.delete(k);
      }
    }
    cubos.set(clave, { inicio: ahora, cuenta: 1 });
    return true;
  }

  if (actual.cuenta >= maximo) return false;
  actual.cuenta += 1;
  return true;
}
