/**
 * Roles y reglas de acceso.
 *
 * Hay dos niveles de comprobacion, y no se deben confundir:
 *
 *   1. El proxy hace una comprobacion OPTIMISTA: lee el rol del JWT,
 *      que ya viaja firmado por Supabase, y redirige sin tocar la base
 *      de datos. Es rapido, pero no es una frontera de seguridad.
 *
 *   2. La verificacion real ocurre en la DAL y en el RLS de Postgres.
 *      Un rol es un dato que el cliente podria manipular en su
 *      petition; lo que no puede es saltarse el RLS.
 */

export type Rol = "estudiante" | "docente" | "admin";

export const ROLES: readonly Rol[] = ["estudiante", "docente", "admin"];

/** Rutas accesibles sin iniciar sesion. */
export const RUTAS_PUBLICAS = ["/", "/login"];

/** Prefijos de ruta que solo puede usar un docente (o un admin). */
export const PREFIJOS_DE_DOCENTE = ["/docente"];

/** Prefijos de ruta que solo puede usar un admin. */
export const PREFIJOS_DE_ADMIN = ["/admin"];

export function esRutaPublica(ruta: string): boolean {
  return RUTAS_PUBLICAS.some((p) => ruta === p || ruta.startsWith(`${p}/`));
}

/**
 * Lee el rol del JWT sin verificar la firma.
 *
 * Es una comprobacion optimista: sirve para redirig rapido, no para
 * autorizar. El token lo firma Supabase y el usuario no puede
 * alterarlo sin la service_role, pero aun asi la decision final la
 * toma Postgres.
 */
export function rolDeClaims(
  claims: { user_metadata?: Record<string, unknown> } | null | undefined,
): Rol | null {
  const rol = claims?.user_metadata?.rol;
  return ROLES.includes(rol as Rol) ? (rol as Rol) : null;
}

/** El rol dentro de los claims verificados de un JWT. */
export function rolDeJwt(
  verificado: { claims?: { user_metadata?: Record<string, unknown> } } | null | undefined,
): Rol | null {
  return rolDeClaims(verificado?.claims);
}

/** Si el rol puede entrar en esa ruta, segun el prefijo. */
export function rolAdmiteRuta(rol: Rol | null, ruta: string): boolean {
  if (rol === "admin") return true;

  const esDeAdmin = PREFIJOS_DE_ADMIN.some((p) => ruta.startsWith(p));
  if (esDeAdmin) return false;

  const esDeDocente = PREFIJOS_DE_DOCENTE.some((p) => ruta.startsWith(p));
  if (esDeDocente) return rol === "docente";

  return true;
}
