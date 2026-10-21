import { test, expect } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

const ARCHIVO_ORDEN = path.join(__dirname, ".ultima-orden.json")

test.describe("Panel de administración y gestión de órdenes (W-011)", () => {
  test("iniciar sesión, abrir Tienda W006 Prueba, ver Dashboard y registrar pago manual de la orden", async ({ page }) => {
    const correo = process.env.E2E_CORREO
    const contrasena = process.env.E2E_CONTRASENA

    test.skip(!correo || !contrasena, "Requiere E2E_CORREO y E2E_CONTRASENA definidos")

    // 1. Iniciar sesión con la cuenta administradora
    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill(correo!)
    await page.getByLabel("Contraseña").fill(contrasena!)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()

    await page.waitForURL(/\/(cuenta|panel)/)

    // Si llega a /cuenta/tiendas, seleccionar "Tienda W006 Prueba"
    if (page.url().includes("/cuenta/tiendas")) {
      const tarjetaTiendaPrueba = page.locator("li", { hasText: "Tienda W006 Prueba" })
      await expect(tarjetaTiendaPrueba).toBeVisible()
      await tarjetaTiendaPrueba.getByRole("button", { name: "Abrir" }).click()
      await page.waitForURL(/\/panel/)
    } else if (!page.url().includes("/panel")) {
      await page.goto("/panel")
    }

    // 2. Verificar que el Dashboard carga correctamente
    await expect(page.getByRole("heading", { name: "Inicio", level: 1 })).toBeVisible()

    // 3. Navegar a /panel/ordenes
    await page.goto("/panel/ordenes")
    await expect(page.getByRole("heading", { name: "Órdenes", level: 1 })).toBeVisible()

    // 4. Localizar la orden recién creada (o la más reciente en la parte superior)
    let numeroBuscado: string | null = null
    if (fs.existsSync(ARCHIVO_ORDEN)) {
      try {
        const info = JSON.parse(fs.readFileSync(ARCHIVO_ORDEN, "utf8"))
        numeroBuscado = info.numeroOrden
      } catch {
        // Ignorar error al leer archivo temporal
      }
    }

    const linkOrden = numeroBuscado
      ? page.getByRole("link", { name: numeroBuscado })
      : page.locator("ul li").first().getByRole("link")

    await expect(linkOrden.first()).toBeVisible()
    const textoOrden = await linkOrden.first().innerText()
    console.log(`[E2E Panel] Abriendo orden para registrar pago: ${textoOrden}`)

    // 5. Entrar al detalle de la orden
    await linkOrden.first().click()
    await page.waitForURL(/\/panel\/ordenes\//)

    await expect(page.getByRole("heading", { name: textoOrden, level: 1 })).toBeVisible()

    // 6. Verificar y registrar pago manual si está pendiente
    const botonPagoManual = page.getByRole("button", { name: "Registrar pago manual" })
    if (await botonPagoManual.isVisible()) {
      await botonPagoManual.click()

      // FormPanel "Registrar pago manual"
      await expect(page.getByRole("heading", { name: "Registrar pago manual" })).toBeVisible()
      await page.getByLabel("Referencia del pago (opcional)").fill("REF-E2E-TRANSFERENCIA")

      // Confirmar pago en el pie de FormPanel
      await page.getByRole("button", { name: "Confirmar" }).click()
    }

    // 7. Verificar que la orden muestra la insignia "Pagada"
    await expect(page.getByText("Pagada").first()).toBeVisible()
    console.log(`[E2E Panel] Orden ${textoOrden} confirmada como Pagada`)
  })
})
