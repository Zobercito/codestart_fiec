import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { obtenerMiPerfil } from "@/lib/auth/dal";

/**
 * Este grupo depende de la sesion, asi que no se puede prerenderizar:
 * se renderiza en el servidor, en cada peticion. Con Cache Components
 * (activado en next.config.ts) eso hay que declararlo, o el build
 * falla al intentar prerenderizar una ruta que lee cookies.
 */
export const instant = false;

/**
 * Layout de las pantallas con sesion.
 *
 * Aqui si se comprueba la sesion de verdad, contra el servidor de
 * Supabase. El proxy solo hace una comprobacion optimista para
 * redirigir rapido; esta es la verificacion real.
 */
export default async function LayoutSesion({ children }: LayoutProps<"/">) {
  const perfil = await obtenerMiPerfil();
  if (!perfil) redirect("/login");

  return (
    <>
      <Navbar perfil={perfil} />
      {children}
    </>
  );
}
