import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renueva la sesion en el proxy.
 *
 * Supabase guarda la sesion en cookies httpOnly, y el token puede
 *caducar. Este helper refresca las cookies en cada peticion, que es lo
 * que mantiene la sesion viva sin que la aplicacion tenga que hacerlo.
 */
export async function actualizarSesion(peticion: NextRequest) {
  let respuesta = NextResponse.next({ request: peticion });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return peticion.cookies.getAll();
        },
        setAll(cookiesParaEstablecer) {
          cookiesParaEstablecer.forEach(({ name, value }) => {
            peticion.cookies.set(name, value);
          });
          respuesta = NextResponse.next({ request: peticion });
          cookiesParaEstablecer.forEach(({ name, value, options }) => {
            respuesta.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getClaims() verifica la firma del JWT localmente (con claves
  // asimétricas) y devuelve sus claims sin ir al servidor. Es el camino
  // rápido: evita un viaje a Auth en cada petición (RNF08).
  const { data: verificado, error } = await supabase.auth.getClaims();

  if (!error && verificado) {
    return { respuesta, autenticado: true, verificado };
  }

  // Fallback: token caducado o proyecto con clave simétrica. getUser()
  // refresca la sesión y valida contra el servidor; sin él, la sesión
  // se caería al caducar el access token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    respuesta,
    autenticado: Boolean(user),
    verificado: user
      ? { claims: { sub: user.id, user_metadata: user.user_metadata } }
      : null,
  };
}
