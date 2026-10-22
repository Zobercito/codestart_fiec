import { test, expect, type Page } from "@playwright/test";

/**
 * El flujo completo del estudiante: entrar, ver el panel, abrir la
 * leccion, llegar al reto, escribir codigo y ver el resultado.
 *
 * Las cuentas las crea `npm run db:usuarios`.
 */

const CORREO = "julieth.rojas@up.ac.pa";
const CLAVE = "Codestart2026!";

/** El reto de codigo: el que el motor de validacion sabe comprobar. */
const RETO_CODIGO = "a3c0bec8-453b-4b1d-bcc3-92445276e359";
/** El reto conceptual (seleccion multiple). */
const RETO_CONCEPTUAL = "cb534a18-b206-4da7-8128-9533ee7631d3";

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

test.describe("Flujo del estudiante", () => {
  test("entrar, ver el panel y llegar a la leccion", async ({ page }) => {
    await entrar(page);

    await expect(page.getByRole("heading", { name: /Camila|Hola|continúa/i }).first()).toBeVisible();
    await expect(page.getByText("Ruta de módulos")).toBeVisible();

    await page.goto("/modulos/3/lecciones/1");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "¿Qué pasa cuando ejecutamos un programa?",
    );
    // La leccion ofrece sus retos.
    await expect(page.getByText("Retos de esta lección")).toBeVisible();
  });

  test("el editor carga y explica por que falla", async ({ page }) => {
    await entrar(page);
    await page.goto(`/retos/${RETO_CODIGO}`);

    // El enunciado y los tres casos de prueba estan.
    await expect(page.getByRole("heading", { name: "Clasifica la edad con un condicional" })).toBeVisible();
    await expect(page.getByText("Casos de prueba")).toBeVisible();
    await expect(page.locator(".cm-content")).toBeVisible();

    // Se escribe el codigo con el error del enunciado (`>` en vez de
    // `>=`) para que la prueba no dependa del borrador que hubiera
    // dejado el estudiante en una vuelta anterior.
    const editor = page.locator(".cm-content");
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(CODIGO_CORRECTO.replace("edad >= 18", "edad > 18"));

    // Verificar: el motor explica el fallo, no solo dice que esta mal.
    await page.getByRole("button", { name: /Verificar solución/i }).click();
    await expect(page.getByText(/usa el operador/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/tu condición/i).first()).toBeVisible();
  });

  test("corregir el codigo aprueba el reto", async ({ page }) => {
    await entrar(page);
    await page.goto(`/retos/${RETO_CODIGO}`);

    const editor = page.locator(".cm-content");
    await editor.waitFor();
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(CODIGO_CORRECTO);

    await page.getByRole("button", { name: /Verificar solución/i }).click();
    await expect(page.getByText(/Aprobado/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/coincide/).first()).toBeVisible();
  });

  test("el borrador sobrevive a una recarga (RF11)", async ({ page }) => {
    await entrar(page);
    await page.goto(`/retos/${RETO_CODIGO}`);

    const editor = page.locator(".cm-content");
    await editor.waitFor();
    await editor.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.type(CODIGO_CORRECTO);

    // El autoguardado va con 1,5 s de retardo.
    await expect(page.getByText(/Autoguardado/)).toBeVisible({ timeout: 20_000 });

    await page.reload();
    await expect(page.locator(".cm-content")).toContainText("edad >= 18", { timeout: 20_000 });
  });

  test("el servidor no acepta una respuesta falseada", async ({ page }) => {
    await entrar(page);

    // Se intenta aprobar sin escribir el codigo que pide el reto.
    const respuesta = await page.evaluate(async (id) => {
      const r = await fetch(`/api/retos/${id}/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: "int main() { return 0; }" }),
      });
      return r.json();
    }, RETO_CODIGO);

    expect(respuesta.acierto).toBe(false);
    expect(respuesta.resultado.errores.length).toBeGreaterThan(0);
  });

  test("el reto conceptual se corrige en el servidor", async ({ page }) => {
    await entrar(page);
    await page.goto(`/retos/${RETO_CONCEPTUAL}`);

    await expect(page.getByText("Reto conceptual")).toBeVisible();
    const opciones = page.locator('input[type="radio"]');
    await expect(opciones).toHaveCount(4);

    // La primera opcion es la correcta.
    await opciones.nth(0).check();
    await page.getByRole("button", { name: /Comprobar respuesta/i }).click();
    await expect(page.getByText(/Correcto/)).toBeVisible({ timeout: 20_000 });
  });

  test("sin sesion no se entra al panel", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 20_000 });
  });
});
