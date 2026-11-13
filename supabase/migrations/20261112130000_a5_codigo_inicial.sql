-- ═══════════════════════════════════════════════════════════════
-- A5 · Código inicial del reto de código (L7)
--
-- El componente de reto traía el código inicial y el fragmento
-- hardcodeados. Ahora salen de `retos.reglas`, que solo lee el
-- servidor. La página mantiene un fallback para los retos que aún
-- no tengan estos campos.
-- ═══════════════════════════════════════════════════════════════

update public.retos
set reglas = reglas || jsonb_build_object(
  'codigo_inicial', $$#include <stdio.h>

int main() {
    int edad = 18;
    if (edad > 18) {
        printf("Mayor de edad\n");
    } else {
        printf("Menor de edad\n");
    }
    return 0;
}$$,
  'fragmento', $$if (condicion) {
    instruccion;
} else {
    instruccion;
}$$
)
where tipo = 'codigo'
  and not (reglas ? 'codigo_inicial');
