import * as os from "node:os"
import * as path from "node:path"
import { defineConfig, devices } from "@playwright/test"

/**
 * Configuración de pruebas end-to-end con Playwright para OTemu.
 * Ver C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion-frontend\tareas\W-018-pruebas-e2e.md
 */
export default defineConfig({
  testDir: "e2e",
  // Fuera del proyecto: si las trazas y capturas se escriben dentro, el modo desarrollo de Next las toma como cambios de código
  // y recarga la página en bucle durante la prueba.
  outputDir: path.join(os.tmpdir(), "otemu-playwright"),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Una compra completa (producto, carrito, checkout, orden) tarda cerca de 30 s en modo desarrollo.
  timeout: 90_000,
  // El modo desarrollo compila cada página la primera vez: se da más margen a las esperas.
  expect: { timeout: 20_000 },
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
