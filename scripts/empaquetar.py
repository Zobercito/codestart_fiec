#!/usr/bin/env python3
"""Empaqueta el entregable sin secretos ni artefactos locales.

    python3 scripts/empaquetar.py

Crea ../codestart-fiec_v1.0.0_2026-11-25.zip con código, documentación,
migraciones, pruebas y scripts. Excluye .env*, .git, node_modules, .next,
.vercel, test-results y respaldos.
"""

from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ.parent / "codestart-fiec_v1.0.0_2026-11-25.zip"

EXCLUIDOS = {
    ".git", "node_modules", ".next", ".vercel", "test-results",
    "playwright-report", "blob-report", "coverage", "respaldos",
    ".agents", ".opencode", ".codegraph", "assets",
}
EXCLUIDOS_ARCHIVO = {
    ".env", ".env.local", ".env.production", ".env.development",
    "tsconfig.tsbuildinfo", "next-env.d.ts", "skills-lock.json", "plan.md",
}

def incluir(ruta: Path) -> bool:
    partes = set(ruta.relative_to(RAIZ).parts)
    if partes & EXCLUIDOS:
        return False
    if ruta.name in EXCLUIDOS_ARCHIVO:
        return False
    if ruta.name.startswith(".env."):
        return False
    if ruta.suffix in {".zip", ".sql.gz"}:
        return False
    return True

archivos = [p for p in RAIZ.rglob("*") if p.is_file() and incluir(p)]
with ZipFile(DESTINO, "w", ZIP_DEFLATED) as z:
    for archivo in sorted(archivos):
        z.write(archivo, archivo.relative_to(RAIZ))

print(f"Paquete: {DESTINO}")
print(f"Archivos: {len(archivos)}")
print("Verifica que no contiene .env.local ni node_modules.")
