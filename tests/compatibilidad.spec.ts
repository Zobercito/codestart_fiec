import { test, expect, type Page } from "@playwright/test";
import { idRetoPorEnunciado } from "./ayudas-datos";

/**
 * Humo de compatibilidad.
 *
 * No repite toda la suite: comprueba que el inicio de sesión, el panel,
 * un módulo, una evaluación y un reto interactivo funcionan en el
 * navegador del proyecto. Se ejecuta en Chromium y en Firefox; WebKit
 * queda pendiente porque este host no tiene sus dependencias.
 */

const ESTUDIANTE = "francisco.gonzalez@up.ac.pa";
const CLAVE = process.env.DEMO_PASSWORD ?? "";
let RETO_ORDENAMIENTO = "";

test.beforeAll(async () => {
  RETO_ORDENAMIENTO = await idRetoPorEnunciado("Ordena el ciclo while");
});

async function entrar(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', ESTUDIANTE);
  await page.fill('input[type="password"]', CLAVE);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

test("humo de compatibilidad del recorrido principal", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

  await entrar(page);
  await expect(
    page.getByRole("heading", { name: /Hola,/i }),
  ).toBeVisible();

  await page.goto("/modulos/1");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();

  await page.goto("/evaluacion/1");
  await expect(
    page.getByRole("heading", { name: "Autoevaluación del módulo 1" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Las partes físicas" }).check();

  await page.goto(`/retos/${RETO_ORDENAMIENTO}`);
  await expect(
    page.getByRole("heading", { name: /Ordena el ciclo while/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Comprobar orden" }),
  ).toBeVisible();
});
