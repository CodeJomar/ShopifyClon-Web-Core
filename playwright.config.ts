import { defineConfig, devices } from "@playwright/test"

/**
 * Configuración de pruebas end-to-end con Playwright para OTemu.
 * Ver C:\UTP-Proyectos\Shopify-Clon-Core\Desarrollo\docs\orquestacion-frontend\tareas\W-018-pruebas-e2e.md
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
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
