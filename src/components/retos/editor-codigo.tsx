"use client";

import { useEffect, useRef } from "react";
import { EditorSelection, EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap, type KeyBinding } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";

/**
 * Al teclear una llave de cierre, salta a la que ya esta escrita en vez
 * de escribir otra.
 *
 * El auto-cierre de CodeMirror inserta la pareja de llaves al escribir
 * `{`, pero solo se salta la que habia puesto si esta pegada al cursor.
 * Con un salto de linea de por medio (que es justo lo que pasa al
 * pulsar Enter) escribe una llave de mas, y el estudiante acaba con un
 * programa que no reconoce: tres llaves de cierre al final.
 *
 * Para un curso de primer ano, ese error cuesta mas que la ayuda que
 * da el auto-cierre. Este atajo lo evita.
 */
const saltarLlaveDeCierre: KeyBinding = {
  key: "}",
  run: (vista) => {
    const { state } = vista;
    const seleccion = state.selection.main;
    if (!seleccion.empty) return false;

    const desde = seleccion.from;
    const coincidencia = /^[ \t\r\n]*\}/.exec(state.doc.sliceString(desde));
    if (!coincidencia) return false;

    vista.dispatch({
      selection: EditorSelection.cursor(desde + coincidencia[0].length),
      scrollIntoView: true,
    });
    return true;
  },
};

/**
 * Editor de codigo (CodeMirror 6).
 *
 * El componente se crea una sola vez y se comunica con React por
 * callbacks: si se recreara en cada render, el cursor saltaria
 * mientras el estudiante escribe.
 */
export function EditorCodigo({
  valor,
  onCambio,
  altura = "h-full",
}: {
  valor: string;
  onCambio: (codigo: string) => void;
  altura?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const vista = useRef<EditorView | null>(null);
  const alCambiar = useRef(onCambio);

  // El callback se guarda en un ref para que el editor no tenga que
  // recrearse cuando el padre cambia la funcion.
  useEffect(() => {
    alCambiar.current = onCambio;
  }, [onCambio]);

  // Creacion: una unica vez.
  useEffect(() => {
    if (!contenedor.current) return;

    const estado = EditorState.create({
      doc: valor,
      extensions: [
        basicSetup,
        cpp(),
        oneDark,
        keymap.of([indentWithTab]),
        EditorView.lineWrapping,
        Prec.highest(keymap.of([saltarLlaveDeCierre])),
        EditorView.updateListener.of((actualizacion) => {
          if (actualizacion.docChanged) {
            alCambiar.current(actualizacion.state.doc.toString());
          }
        }),
        EditorView.theme({
          "&": { height: "100%", fontSize: "12.5px" },
          ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.7" },
          ".cm-gutters": { backgroundColor: "transparent", color: "#64748B" },
        }),
      ],
    });

    const editor = new EditorView({ state: estado, parent: contenedor.current });
    vista.current = editor;

    return () => {
      editor.destroy();
      vista.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizacion cuando el valor cambia desde fuera (por ejemplo, al
  // reiniciar el editor con el codigo inicial).
  useEffect(() => {
    const editor = vista.current;
    if (!editor) return;
    const actual = editor.state.doc.toString();
    if (actual === valor) return;
    editor.dispatch({
      changes: { from: 0, to: actual.length, insert: valor },
    });
  }, [valor]);

  return <div ref={contenedor} className={altura} />;
}
