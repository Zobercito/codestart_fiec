import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accesibilidad automatizada con axe.
 *
 * No sustituye la revisión manual (teclado, foco, zoom, lector), pero
 * detecta las violaciones críticas y serias de WCAG 2.1 A/AA en las
 * rutas nuevas del Avance 4. El umbral es 0: si aparece una, la prueba
 * falla y el detalle queda en el mensaje.
 */

const ESTUDIANTE = "francisco.gonzalez@up.ac.pa";
const DOCENTE = "docente@up.ac.pa";
const CLAVE = "Codestart2026!";
const RETO_ORDENAMIENTO = "6b8faf30-2856-40c3-bc68-d0781ebfd3f3";

async function entrar(page: Page, correo: string, destino: RegExp) {
  await page.goto("/login");
  await page.fill('input[type="email"]', correo);
  await page.fill('input[type="password"]', CLAVE);
  await page.click('button[type="submit"]');
  await page.waitForURL(destino, { timeout: 30_000 });
}

async function analizar(page: Page, ruta: string) {
  await expect(page.locator("h1").first()).toBeVisible({ timeout: 30_000 });

  const resultado = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const graves = resultado.violations.filter(
    (violacion) =>
      violacion.impact === "critical" || violacion.impact === "serious",
  );

  expect(
    graves,
    `${ruta}: ${graves
      .map(
        (violacion) =>
          `${violacion.id} (${violacion.impact}) en ${violacion.nodes
            .map((nodo) => nodo.target.join(" "))
            .join(", ")}`,
      )
      .join(" | ")}`,
  ).toEqual([]);
}

test.describe("Accesibilidad · rutas públicas", () => {
  for (const ruta of ["/", "/login", "/privacidad"]) {
    test(`sin violaciones graves en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      await analizar(page, ruta);
    });
  }
});

test.describe("Accesibilidad · estudiante", () => {
  test("sin violaciones graves en el recorrido del estudiante", async ({
    page,
  }) => {
    await entrar(page, ESTUDIANTE, /\/dashboard/);

    for (const ruta of [
      "/dashboard",
      "/modulos",
      "/modulos/1",
      "/medallas",
      "/evaluacion/1",
      `/retos/${RETO_ORDENAMIENTO}`,
    ]) {
      await page.goto(ruta);
      await analizar(page, ruta);
    }

    await page.goto("/modulos/1");
    const enlaceLeccion = page.locator('a[href*="/lecciones/"]').first();
    await expect(enlaceLeccion).toBeVisible();
    await enlaceLeccion.click();
    await page.waitForURL(/\/modulos\/1\/lecciones\//, { timeout: 30_000 });
    await analizar(page, new URL(page.url()).pathname);
  });
});

test.describe("Accesibilidad · docente", () => {
  test("sin violaciones graves en el panel y el seguimiento", async ({
    page,
  }) => {
    await entrar(page, DOCENTE, /\/docente$/);

    for (const ruta of ["/docente", "/docente/asignar"]) {
      await page.goto(ruta);
      await analizar(page, ruta);
    }

    await page.goto("/docente");
    const seguimiento = page.getByRole("link", { name: "Ver seguimiento" });
    await expect(seguimiento).toBeVisible();
    await seguimiento.click();
    await page.waitForURL(/\/docente\/grupo\//, { timeout: 30_000 });
    await analizar(page, new URL(page.url()).pathname);
  });
});
