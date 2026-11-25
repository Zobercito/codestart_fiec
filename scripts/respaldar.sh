#!/usr/bin/env bash
# Respaldo lógico de CodeStart FIEC.
#
#   bash scripts/respaldar.sh
#
# Requiere `pg_dump` (paquete postgresql-client) y SUPABASE_DB_URL en
# .env.local o en el entorno. El archivo se guarda fuera de git.

set -euo pipefail

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
fi

: "${SUPABASE_DB_URL:?Falta SUPABASE_DB_URL en .env.local}"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Falta pg_dump. Instala postgresql-client y vuelve a intentarlo." >&2
  echo "Alternativa: usa los respaldos automáticos del panel de Supabase." >&2
  exit 1
fi

mkdir -p respaldos
chmod 700 respaldos
archivo="respaldos/codestart-fiec_$(date +%Y-%m-%d_%H%M).sql"

pg_dump "$SUPABASE_DB_URL" --no-owner --no-privileges > "$archivo"
chmod 600 "$archivo"

echo "Respaldo creado: $archivo"
echo "Guárdalo fuera del repositorio. No lo subas a git."
