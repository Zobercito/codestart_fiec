import { NextResponse, type NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";
import { esRutaPublica, rolAdmiteRuta, rolDeJwt } from "@/lib/auth/roles";

/**
 * Proxy de Next.js 16 (antes middleware.ts).
 *
 * Hace una comprobacion OPTIMISTA de la sesion: lee el rol del JWT, que
 * ya viene firmado por Supabase, y redirige sin consultar la base de
 * datos. Es rapido, pero no es una frontera de seguridad: la
 * verificacion real esta en la DAL y en el RLS de Postgres.
 */
export default async function proxy(peticion: NextRequest) {
  const { respuesta, usuario, verificado } = await actualizarSesion(peticion);
  const ruta = peticion.nextUrl.pathname;

  // Sin sesion: solo se admiten las rutas publicas.
  if (!usuario) {
    if (esRutaPublica(ruta)) return respuesta;
    const destino = new URL("/login", peticion.url);
    destino.searchParams.set("desde", ruta);
    return NextResponse.redirect(destino);
  }

  // Con sesion: la portada y las pantallas de acceso ya no hacen falta.
  if (ruta === "/" || ruta === "/login") {
    return NextResponse.redirect(new URL("/dashboard", peticion.url));
  }

  // El rol sale del JWT. Si no permite la ruta, se vuelve al panel.
  const rol = rolDeJwt(verificado);
  if (!rolAdmiteRuta(rol, ruta)) {
    return NextResponse.redirect(new URL("/dashboard", peticion.url));
  }

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
