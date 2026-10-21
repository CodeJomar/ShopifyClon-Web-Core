import { test, expect } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

const ARCHIVO_ORDEN = path.join(__dirname, ".ultima-orden.json")

test.describe("Flujo de compra de invitado (W-015, W-016)", () => {
  test("como invitado, agregar producto al carrito, completar checkout y confirmar orden", async ({ page }) => {
    // 1. Ir al producto publicado Plato W008 UI en tienda-w006-prueba
    await page.goto("/tienda/tienda-w006-prueba/productos/plato-w008-ui")
    await expect(page.getByRole("heading", { name: "Plato W008 UI", level: 1 })).toBeVisible()

    // 2. Agregar al carrito
    const botonAgregar = page.getByRole("button", { name: "Agregar al carrito" })
    await botonAgregar.click()

    // 3. Ir al carrito
    await page.goto("/tienda/tienda-w006-prueba/carrito")
    await expect(page.getByRole("heading", { name: "Tu carrito", level: 1 })).toBeVisible()
    await expect(page.getByText("Plato W008 UI").first()).toBeVisible()
    await expect(page.getByText("Total estimado")).toBeVisible()

    // 4. Continuar al checkout
    const botonCheckout = page.getByRole("link", { name: "Continuar con la compra" })
    await botonCheckout.click()

    await page.waitForURL(/\/tienda\/tienda-w006-prueba\/checkout/)
    await expect(page.getByRole("heading", { name: "Tus datos" })).toBeVisible()

    // 5. Llenar formulario de datos y envío
    await page.getByLabel("Correo").fill("comprador.e2e@otemu.test")
    await page.getByLabel("Nombre y apellido").fill("Comprador E2E Playwright")
    await page.getByLabel("Quien recibe").fill("Comprador E2E Playwright")
    await page.getByLabel("Dirección").fill("Av. Larco 123, Dpto 402")
    await page.getByLabel("Ciudad").fill("Lima")
    await page.getByLabel("Departamento o provincia").fill("Lima")
    await page.getByLabel("Código postal").fill("15074")

    // Si hay selector de tarifas de envío, asegurarse de seleccionar una opción
    const selectTarifa = page.locator('select[name="tarifa_envio_id"]')
    if (await selectTarifa.isVisible()) {
      const opciones = await selectTarifa.locator("option").all()
      if (opciones.length > 0) {
        const valorTarifa = await opciones[0].getAttribute("value")
        if (valorTarifa) {
          await selectTarifa.selectOption(valorTarifa)
        }
      }
    }

    // Avanzar al paso de resumen
    await page.getByRole("button", { name: "Continuar" }).click()

    // 6. Resumen y confirmación de compra
    await expect(page.getByRole("heading", { name: "Resumen" })).toBeVisible()
    const botonConfirmar = page.getByRole("button", { name: "Confirmar compra" })
    await botonConfirmar.click()

    // TODO(W-016-C1): Con cotización previa de envío en checkout, la API no devuelve CHK-004.
    // Mientras tanto, si la API responde "El total cambió", confirmamos por segunda vez con el total recalculado.
    const avisoCambioTotal = page.getByText(/El total cambió/i)
    try {
      await avisoCambioTotal.waitFor({ state: "visible", timeout: 4000 })
      await page.getByRole("button", { name: "Confirmar compra" }).click()
    } catch {
      // Si no apareció CHK-004, la orden fue creada directamente
    }

    // 7. Página pública de la orden
    await page.waitForURL(/\/tienda\/tienda-w006-prueba\/orden\//, { timeout: 15000 })
    const headingOrden = page.getByRole("heading", { level: 1 })
    await expect(headingOrden).toBeVisible()
    const numeroOrden = (await headingOrden.innerText()).trim()

    // Verificar que indica pago pendiente
    await expect(page.getByText("Pago pendiente")).toBeVisible()

    // Registrar en salida para el reporte y guardarlo para panel.spec.ts
    console.log(`[E2E Compra] Orden creada exitosamente: ${numeroOrden}`)
    try {
      fs.writeFileSync(ARCHIVO_ORDEN, JSON.stringify({ numeroOrden, creadoEn: new Date().toISOString() }))
    } catch {
      // Ignorar error al escribir archivo temporal
    }

    expect(numeroOrden.length).toBeGreaterThan(0)
  })
})
