import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de extremo a extremo del flujo del estudiante.
 *
 *   npm run test:e2e
 *
 * Corre contra el servidor de PRODUCCION (`npm run build && npm start`),
 * no contra el de desarrollo: lo que se mide es lo que se entrega. El
 * servidor de pruebas es el mismo que hay que levantar antes, con la
 * base de datos real, porque el motor de validacion lee las reglas y
 * los casos de ahi.
 *
 * Las cuentas de prueba las crea `npm run db:usuarios`.
 */

const PUERTO = 3000;
const BASE = `http://localhost:${PUERTO}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],

  use: {
    baseURL: BASE,
    locale: "es-PA",
    timezoneId: "America/Panama",
    trace: "retain-on-failure",
  },

  projects: [
    {
      name: "escritorio",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      // El dispositivo real del curso es la tableta. Se prueba con
      // Chromium en el tamano de un iPad, con pantalla tactil: lo que
      // se comprueba es la maquetacion y que todo se puede tocar.
      name: "tableta",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 834, height: 1194 },
        hasTouch: true,
        isMobile: false,
      },
    },
    {
      // Compatibilidad: Firefox de escritorio. WebKit no se puede
      // ejecutar en este host porque faltan dependencias del sistema;
      // se documenta como pendiente en el informe de pruebas.
      name: "firefox-escritorio",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: {
    command: "npm run build && npm start",
    url: BASE,
    reuseExistingServer: true,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
