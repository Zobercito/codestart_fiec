import { NextResponse, type NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";
import {
  esRutaPublica,
  rolDeJwt,
  rutaDeInicio,
} from "@/lib/auth/roles";

/**
 * Proxy de Next.js 16 (antes middleware.ts).
 *
 * Hace una comprobacion OPTIMISTA de la sesion: lee el rol del JWT, que
 * ya viene firmado por Supabase, y redirige sin consultar la base de
 * datos. Es rapido, pero no es una frontera de seguridad: la
 * verificacion real esta en la DAL y en el RLS de Postgres.
 *
 * El rol del JWT solo se usa para elegir la pantalla de inicio. No se
 * bloquean rutas por rol: el JWT puede ir desfasado respecto de
 * `perfiles.rol` (cambio de rol, token antiguo) y bloquear aquí crearía
 * un bucle /dashboard <-> /docente. Cada página vuelve a comprobar el
 * rol con la DAL antes de leer datos.
 */
export default async function proxy(peticion: NextRequest) {
  const { respuesta, autenticado, verificado } = await actualizarSesion(peticion);
  const ruta = peticion.nextUrl.pathname;

  // Sin sesion: solo se admiten las rutas publicas.
  if (!autenticado) {
    if (esRutaPublica(ruta)) return respuesta;
    if (ruta.startsWith("/api/")) {
      return NextResponse.json(
        { error: "No hay sesión activa." },
        { status: 401 },
      );
    }
    const destino = new URL("/login", peticion.url);
    destino.searchParams.set("desde", ruta);
    return NextResponse.redirect(destino);
  }

  // El rol sale del JWT. Cada rol vuelve a su propia pantalla de inicio.
  const rol = rolDeJwt(verificado);

  // Con sesion: la portada y las pantallas de acceso ya no hacen falta.
  if (ruta === "/" || ruta === "/login") {
    return NextResponse.redirect(new URL(rutaDeInicio(rol), peticion.url));
  }

  // Si el rol no permite la ruta, no se bloquea aquí: el JWT puede ir
  // desfasado respecto de `perfiles.rol` y se crearía un bucle
  // /dashboard <-> /docente. Cada página comprueba el rol con la DAL.
  return respuesta;
}

export const config = {
  matcher: [
    /*
     * Todo menos los recursos estaticos y las imagenes.
     */
    "/((?!_next/static|_next/image|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
