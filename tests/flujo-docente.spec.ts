import { test, expect, type Page } from "@playwright/test";
import { ejecutarSql } from "./ayudas-db";

/**
 * Flujo del docente: panel, seguimiento, detalle y creación de una
 * asignación.
 *
 * Las pruebas de lectura usan el grupo del seed. La prueba de escritura
 * crea un grupo con un código único y lo borra al terminar, para no
 * dejar basura en la base de demostración.
 */

const CORREO = "docente@up.ac.pa";
const CLAVE = "Codestart2026!";

let nombreGrupo = "";
let codigoGrupo = "";

function limpiarGrupo(codigo: string) {
  const limpio = codigo.replace(/'/g, "''");
  ejecutarSql(`
    delete from public.asignaciones
    where grupo_id in (
      select id from public.grupos where codigo_inscripcion = '${limpio}'
    );
    delete from public.grupos
    where codigo_inscripcion = '${limpio}';
  `);
}

async function entrarDocente(page: Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', CORREO);
  await page.fill('input[type="password"]', CLAVE);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/docente$/, { timeout: 30_000 });
}

test.describe("Flujo del docente", () => {
  test.afterAll(async () => {
    if (codigoGrupo) limpiarGrupo(codigoGrupo);
  });

  test("el docente no aterriza en el dashboard del estudiante", async ({
    page,
  }) => {
    await entrarDocente(page);
    await page.goto("/dashboard");
    await page.waitForURL(/\/docente$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Hola,/i })).toBeVisible();
  });

  test("el panel muestra indicadores, errores y seguimiento reales", async ({
    page,
  }) => {
    await entrarDocente(page);

    await expect(
      page.getByRole("heading", { name: /Hola,/i }),
    ).toBeVisible();
    await expect(page.getByText("Cumplimiento", { exact: true })).toBeVisible();
    await expect(page.getByText("Tasa de acierto", { exact: true })).toBeVisible();
    await expect(page.getByText("Atrasados", { exact: true })).toBeVisible();
    await expect(page.getByText("Punto crítico", { exact: true })).toBeVisible();
    await expect(page.getByText("Errores frecuentes", { exact: true })).toBeVisible();
    await expect(
      page.getByText(/Datos reales de Sección 1 · Verano 2026/),
    ).toBeVisible();

    await page.getByRole("link", { name: "Ver seguimiento" }).click();
    await page.waitForURL(/\/docente\/grupo\//);

    await expect(page.getByRole("heading", { name: /Sección 1/i })).toBeVisible();
    await expect(page.getByText("Seguimiento", { exact: true })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Estudiante" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Estado" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Avance" })).toBeVisible();
    await expect(page.getByText("Francisco González").first()).toBeVisible();

    await page.getByRole("link", { name: "Ver detalle" }).first().click();
    await page.waitForURL(/\/docente\/estudiante\//);

    await expect(
      page.getByRole("heading", { name: /Progreso por módulo/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Últimos intentos/i }),
    ).toBeVisible();
  });

  test("el modo clase oculta las pistas del reto", async ({ page }) => {
    await entrarDocente(page);
    await page.goto(
      "/retos/6b8faf30-2856-40c3-bc68-d0781ebfd3f3",
    );

    await expect(
      page.getByText("Modo clase: pistas y soluciones ocultas."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Pista 1/ })).toHaveCount(0);
    await expect(page.getByText("Pistas", { exact: true })).toHaveCount(0);
  });

  test("el docente previsualiza una evaluación sin entregarla", async ({
    page,
  }) => {
    await entrarDocente(page);
    await page.goto("/evaluacion/1");

    await expect(page.getByText(/Modo clase/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Entregar evaluación" }),
    ).toHaveCount(0);
  });

  test("crear un grupo y asignarle un módulo", async ({ page }) => {
    // El código del grupo tiene tope de 24 caracteres: el nombre del
    // proyecto no puede entrar en el sufijo (Firefox lo excedía).
    const sufijo = `${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 4)}`.toUpperCase();
    nombreGrupo = `Grupo E2E ${sufijo}`;
    codigoGrupo = `E2E-${sufijo}`;

    await entrarDocente(page);
    await page.goto("/docente/grupos");

    await page.getByLabel("Nombre del grupo").fill(nombreGrupo);
    await page.getByLabel("Código de inscripción").fill(codigoGrupo);
    await page.getByRole("button", { name: "Crear grupo" }).click();

    await expect(page.getByText(new RegExp(`Grupo creado`))).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByText(nombreGrupo).first()).toBeVisible();

    await page.goto("/docente/asignar");
    await page
      .getByLabel("Grupo")
      .selectOption({ label: `${nombreGrupo} · 0 estudiantes` });

    const manana = new Date(Date.now() + 86_400_000)
      .toISOString()
      .slice(0, 10);
    await page.getByLabel("Fecha de entrega").fill(manana);
    await page.getByLabel("Descripción (opcional)").fill("Actividad de prueba E2E");
    await page.getByRole("button", { name: "Crear asignación" }).click();

    await expect(
      page.getByText(/Asignación creada/),
    ).toBeVisible({ timeout: 20_000 });

    await page.goto("/docente/grupos");
    const tarjeta = page
      .locator("li")
      .filter({ hasText: nombreGrupo })
      .first();
    await expect(tarjeta).toBeVisible();
    await tarjeta.getByRole("link", { name: "Ver seguimiento" }).click();
    await page.waitForURL(/\/docente\/grupo\//);

    await expect(page.getByText("Asignaciones", { exact: true })).toBeVisible();
    await expect(page.getByText(/Módulo 1:/).first()).toBeVisible();
  });
});
