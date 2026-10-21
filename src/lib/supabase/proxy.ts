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

  // getUser() valida el token contra el servidor de Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // getClaims() verifica la firma del JWT localmente y devuelve sus
  // claims, sin ir al servidor. De ahi sale el rol, para la
  // comprobacion optimista de rutas.
  const { data: verificado } = await supabase.auth.getClaims();

  return { respuesta, usuario: user, verificado };
}
