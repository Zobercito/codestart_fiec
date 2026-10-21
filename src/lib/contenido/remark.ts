import { visit, SKIP } from "unist-util-visit";

type Nodo = {
  type: string;
  depth?: number;
  children?: Nodo[];
};

type Padre = { children: Nodo[] };

/**
 * Quita el primer titulo de nivel 1 del MDX.
 *
 * El titulo de la leccion lo pone la pagina, con su barra de progreso y
 * sus botones de navegacion. Si el MDX lo trae tambien, el titulo sale
 * dos veces.
 *
 * El archivo de contenido sigue siendo autocontenido (con su # arriba),
 * que es lo que hace falta si alguien lo lee suelto en el repositorio.
 */
export function remarkQuitarPrimerH1() {
  return (arbol: Nodo) => {
    visit(arbol as never, "heading", (nodo: Nodo, indice, padre) => {
      const p = padre as Padre | undefined;
      if (nodo.depth === 1 && indice === 0 && p && Array.isArray(p.children)) {
        p.children.splice(indice, 1);
        return [SKIP, indice];
      }
      return undefined;
    });
  };
}
