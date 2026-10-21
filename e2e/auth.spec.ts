import { test, expect } from "@playwright/test"

test.describe("Autenticación y sesión (W-004)", () => {
  test("login con credenciales incorrectas muestra error USR-004 sin recargar la página", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByRole("heading", { name: "Inicia sesión", level: 1 })).toBeVisible()

    await page.getByLabel("Correo electrónico").fill("correo.inexistente@otemu.test")
    await page.getByLabel("Contraseña").fill("ClaveIncorrecta123!")

    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    const alerta = page.getByRole("alert")
    await expect(alerta).toBeVisible()
    await expect(alerta).toContainText(/USR-004|No pudimos iniciar sesión|incorrectos/i)

    // La página no se recarga ni navega a otra ruta
    expect(new URL(page.url()).pathname).toBe("/login")
  })

  test("login correcto redirige al panel o a la cuenta", async ({ page }) => {
    const correo = process.env.E2E_CORREO
    const contrasena = process.env.E2E_CONTRASENA

    test.skip(!correo || !contrasena, "Requiere E2E_CORREO y E2E_CONTRASENA definidos")

    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill(correo!)
    await page.getByLabel("Contraseña").fill(contrasena!)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await page.waitForURL(/\/(cuenta|panel)/)
    const pathname = new URL(page.url()).pathname
    expect(pathname).toMatch(/\/(cuenta|panel)/)
  })

  test("cerrar sesión invalida la sesión y protege /cuenta", async ({ page }) => {
    const correo = process.env.E2E_CORREO
    const contrasena = process.env.E2E_CONTRASENA

    test.skip(!correo || !contrasena, "Requiere E2E_CORREO y E2E_CONTRASENA definidos")

    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill(correo!)
    await page.getByLabel("Contraseña").fill(contrasena!)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await page.waitForURL(/\/(cuenta|panel)/)

    // Abrir menú de usuario y cerrar sesión
    await page.getByRole("button", { name: "Menú de la cuenta" }).click()
    await page.getByRole("menuitem", { name: "Cerrar sesión" }).click()

    await page.waitForURL(/\/login/)
    expect(new URL(page.url()).pathname).toBe("/login")

    // Intentar acceder a ruta protegida /cuenta
    await page.goto("/cuenta")
    await page.waitForURL(/\/login/)
    expect(new URL(page.url()).pathname).toBe("/login")
    expect(new URL(page.url()).searchParams.get("siguiente")).toBe("/cuenta")
  })
})
