import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Vitest solo recoge las pruebas unitarias del motor de validacion.
 *
 * Las de extremo a extremo las lleva Playwright (`npm run test:e2e`) y
 * viven en `tests/`: si Vitest las recoge tambien, falla porque
 * `test.describe` de Playwright no se puede llamar dentro de Vitest.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules/**", "tests/**", ".next/**"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
