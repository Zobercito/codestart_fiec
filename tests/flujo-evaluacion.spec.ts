import { test, expect, type Page } from "@playwright/test";
import { idRetoPorEnunciado } from "./ayudas-datos";

/**
 * Retos de ordenamiento y autocompletado, y evaluaciones.
 *
 * Los ids salen del contenido provisional de la migración A4. Si el
 * contenido se vuelve a sembrar, los ids cambian; por eso las pruebas
 * que crean datos usan la UI y no dependen de ids de intentos.
 */

const CORREO = "francisco.gonzalez@up.ac.pa";
const CLAVE = process.env.DEMO_PASSWORD ?? "";

let ORDENAMIENTO = "";
let AUTOCOMPLETADO = "";

test.beforeAll(async () => {
  ORDENAMIENTO = await idRetoPorEnunciado("Ordena el ciclo while");
  AUTOCOMPLETADO = await idRetoPorEnunciado("Completa el ciclo que imprime");
});

async function entrar(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', CORREO);
  await page.fill('input[type="password"]', CLAVE);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
}

test.describe("Retos interactivos y evaluaciones", () => {
  test("ordenar los pasos de un ciclo corrige en el servidor", async ({
    page,
  }) => {
    await entrar(page);
    await page.goto(`/retos/${ORDENAMIENTO}`);

    await expect(
      page.getByRole("heading", { name: /Ordena el ciclo while/ }),
    ).toBeVisible();

    // Orden inicial: d, b, e, a, c. Secuencia para llegar a a, b, c, d, e.
    await page.getByRole("button", { name: /Subir «int i = 1;»/ }).click();
    await page.getByRole("button", { name: /Subir «int i = 1;»/ }).click();
    await page.getByRole("button", { name: /Subir «int i = 1;»/ }).click();
    await page
      .getByRole("button", { name: /Subir «while \(i <= 5\) \{»/ })
      .click();
    await page
      .getByRole("button", { name: /Subir «printf\("%d\\n", i\);»/ })
      .click();
    await page
      .getByRole("button", { name: /Subir «printf\("%d\\n", i\);»/ })
      .click();

    const items = page
      .getByRole("list", { name: "Pasos para ordenar" })
      .getByRole("listitem");
    await expect(items.first()).toContainText("int i = 1;");

    await page.getByRole("button", { name: "Comprobar orden" }).click();
    await expect(page.getByText("✓ Orden correcto.")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("autocompletar un ciclo valida cada espacio", async ({ page }) => {
    await entrar(page);
    await page.goto(`/retos/${AUTOCOMPLETADO}`);

    await page
      .getByLabel("Condición del ciclo")
      .selectOption({ label: "i <= 5" });
    await page
      .getByLabel("Cambio de la variable")
      .selectOption({ label: "i = i + 1" });
    await page.getByRole("button", { name: "Comprobar respuestas" }).click();

    await expect(page.getByText("✓ Todo correcto.")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("la autoevaluación de un módulo califica y muestra áreas", async ({
    page,
  }) => {
    await entrar(page);
    await page.goto("/evaluacion/3");

    await expect(
      page.getByRole("heading", { name: "Autoevaluación del módulo 3" }),
    ).toBeVisible();
    await expect(page.getByText("5 preguntas · 60 % para aprobar")).toBeVisible();

    await page.getByRole("radio", { name: "Traduce el programa antes de ejecutarlo" }).check();
    await page.getByRole("radio", { name: "stdio.h" }).check();
    await page.getByRole("radio", { name: "Que el programa terminó correctamente" }).check();
    await page.getByRole("radio", { name: "Traduce y ejecuta paso a paso" }).check();
    await page.getByRole("radio", { name: "El cuerpo de la función" }).check();

    await page.getByRole("button", { name: "Entregar evaluación" }).click();

    await expect(page.getByText("100 %", { exact: true }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(/Aprobaste con 100 %/)).toBeVisible();
    await expect(page.getByText("5 de 5 respuestas correctas")).toBeVisible();
    await expect(page.getByText("Anatomía")).toBeVisible();
  });

  test("la evaluación final exige haber completado los módulos 1–7", async ({
    page,
  }) => {
    await entrar(page);
    await page.goto("/evaluacion/final");

    // L6: sin los módulos 1–7 completos, la evaluación final redirige
    // al módulo en curso.
    await page.waitForURL(/\/modulos(\/\d+)?$/, { timeout: 30_000 });
    await expect(
      page.getByRole("link", { name: "Ruta de módulos" }),
    ).toBeVisible();
  });

  test("el docente ve las quince preguntas de la evaluación final en modo clase", async ({
    page,
  }) => {
    await page.goto("/login");
    await page.fill('input[type="email"]', "docente@up.ac.pa");
    await page.fill('input[type="password"]', CLAVE);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/docente$/, { timeout: 30_000 });

    await page.goto("/evaluacion/final");

    await expect(
      page.getByRole("heading", { name: "Evaluación final del curso" }),
    ).toBeVisible();
    await expect(
      page.getByText("15 preguntas · 70 % para aprobar"),
    ).toBeVisible();
    await expect(page.locator("fieldset")).toHaveCount(15);
  });

  test("un estudiante no puede activar el modo clase por URL", async ({
    page,
  }) => {
    await entrar(page);
    await page.goto(`/retos/${ORDENAMIENTO}?modo=clase`);

    await expect(
      page.getByText("Modo clase: pistas y soluciones ocultas."),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /Pista 1/ }),
    ).toBeVisible();
  });

  test("el módulo 5 abre su lección y su autoevaluación", async ({ page }) => {
    await entrar(page);
    await page.goto("/modulos/5");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Estructuras de control de flujo",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Estructuras de control de flujo/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Empezar autoevaluación" }),
    ).toBeVisible();
  });
});
