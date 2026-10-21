import { MDXRemote } from "next-mdx-remote/rsc";
import { COMPONENTES_MDX } from "./componentes";
import { remarkQuitarPrimerH1 } from "./remark";

/**
 * Renderiza el MDX de una leccion.
 *
 * Es un Server Component: el contenido se compila en el servidor y
 * llega al navegador ya renderizado. Los componentes interactivos que
 * la leccion incruste son client components ("use client") y por eso
 * siguen siendo interactivos.
 */
export function ContenidoMDX({ fuente }: { fuente: string }) {
  return (
    <div className="mdx">
      <MDXRemote
        source={fuente}
        /*
         * next-mdx-remote v6 compila el MDX con blockJS: true, y ese
         * plugin BORRA los atributos con expresion de los componentes
         * (<Componente datos={[{...}]} /> llega sin props). Con
         * blockJS: false se permiten, y blockDangerousJS: true sigue
         * bloqueando eval, Function, require, process y el resto de
         * globales peligrosos.
         *
         * Es aceptable porque el contenido lo escribe el equipo y
         * esta versionado en el repositorio: no lo escribe un
         * visitante.
         */
        options={{
          blockJS: false,
          blockDangerousJS: true,
          mdxOptions: { remarkPlugins: [remarkQuitarPrimerH1] },
        }}
        components={COMPONENTES_MDX}
      />
    </div>
  );
}
