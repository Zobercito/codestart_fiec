import { test, expect, type Page } from "@playwright/test";

/**
 * Cada rol debe aterrizar en su propia pantalla. Antes del hotfix,
 * docente y estudiante terminaban en el dashboard del estudiante.
 */

const CLAVE = "Codestart2026!";

async function entrar(page: Page, correo: string, destino: RegExp) {
  await page.goto("/login");
  await page.fill('input[type="email"]', correo);
  await page.fill('input[type="password"]', CLAVE);
  await page.click('button[type="submit"]');
  await page.waitForURL(destino, { timeout: 30_000 });
}

test("el docente aterriza en su panel, no en el dashboard", async ({ page }) => {
  await entrar(page, "docente@up.ac.pa", /\/docente$/);
  await expect(
    page.getByRole("heading", { name: "Panel docente" }),
  ).toBeVisible();

  await page.goto("/dashboard");
  await page.waitForURL(/\/docente$/, { timeout: 30_000 });
});

test("el estudiante conserva su dashboard", async ({ page }) => {
  await entrar(page, "francisco.gonzalez@up.ac.pa", /\/dashboard/);
  await expect(
    page.getByRole("heading", { name: /Hola,/i }),
  ).toBeVisible();
});
