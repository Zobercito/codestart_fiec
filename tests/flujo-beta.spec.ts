import { test, expect, type Page } from "@playwright/test";
import { ejecutarSql } from "./ayudas-db";

/**
 * Comprobaciones del Avance 4 que no estaban en la suite alfa:
 * progreso explícito, bloqueo de módulos, insignias por trigger y
 * aviso de privacidad.
 */

const CORREO = "francisco.gonzalez@up.ac.pa";
const CLAVE = "Codestart2026!";
const RETO_CODIGO = "a3c0bec8-453b-4b1d-bcc3-92445276e359";

const CODIGO_CORRECTO = `#include <stdio.h>

int main() {
    int edad = 18;
    if (edad >= 18) {
        printf("Mayor de edad\\n");
    } else {
        printf("Menor de edad\\n");
    }
    return 0;
}`;

async function entrar(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', CORREO);
  await page.fill('input[type="password"]', CLAVE);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

test.describe("Avance 4 · progreso, insignias y privacidad", () => {
  test.beforeAll(() => {
    // Las pruebas de bloqueo necesitan un módulo con contenido detrás
    // del módulo en curso. Los módulos 6 y 7 están vacíos en la beta;
    // se añaden dos lecciones temporales y se borran al terminar.
    ejecutarSql(`
      delete from public.lecciones where titulo = 'Lección temporal E2E';
      insert into public.lecciones
        (modulo_id, titulo, orden, archivo_contenido, duracion_min)
      select id, 'Lección temporal E2E', 99, 'lecciones/m04-variables.mdx', 1
      from public.modulos where orden = 6;
      insert into public.lecciones
        (modulo_id, titulo, orden, archivo_contenido, duracion_min)
      select id, 'Lección temporal E2E', 99, 'lecciones/m04-variables.mdx', 1
      from public.modulos where orden = 7;
    `);
  });

  test.afterAll(() => {
    ejecutarSql(
      "delete from public.lecciones where titulo = 'Lección temporal E2E';",
    );
  });

  test("marcar una lección como vista persiste el progreso", async ({ page }) => {
    await entrar(page);
    await page.goto("/modulos/4/lecciones/1");

    const boton = page.getByRole("button", {
      name: /Marcar como vista|Continuar/,
    });
    await expect(boton).toBeVisible();

    await boton.click();
    await page.waitForURL((url) => !url.pathname.endsWith("/modulos/4/lecciones/1"), {
      timeout: 30_000,
    });

    await page.goto("/modulos/4/lecciones/1");
    await expect(page.getByText("Lección completada")).toBeVisible();
    await expect(page.getByText("Tu progreso ya está guardado")).toBeVisible();
  });

  test("un módulo bloqueado no se abre por URL", async ({ page }) => {
    await entrar(page);
    await page.goto("/modulos/7/lecciones/99");

    await expect(page).toHaveURL(/\/modulos\/\d+$/, { timeout: 30_000 });
    await expect(page).not.toHaveURL(/\/modulos\/7$/);
    await expect(page.getByText("Ruta de módulos").first()).toBeVisible();
  });

  test("aprobar un reto crea la insignia Primer reto", async ({ page }) => {
    await entrar(page);
    await page.goto(`/retos/${RETO_CODIGO}`);

    const editor = page.locator(".cm-content");
    await editor.waitFor();
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(CODIGO_CORRECTO);

    await page.getByRole("button", { name: /Verificar solución/i }).click();
    await expect(page.getByText(/Aprobado/)).toBeVisible({ timeout: 20_000 });

    await page.goto("/medallas");
    await expect(page.getByRole("heading", { name: "Mis medallas" })).toBeVisible();
    await expect(page.getByText("Primer reto").first()).toBeVisible();
  });

  test("el acceso solo ofrece iniciar sesión", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Entra a tu cuenta" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Regístrate|Crear cuenta/i }),
    ).toHaveCount(0);

    await page.goto("/registro");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/privacidad");
    await expect(
      page.getByRole("heading", { name: "Aviso de privacidad" }),
    ).toBeVisible();
  });
});
