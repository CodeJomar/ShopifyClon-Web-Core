import { test, expect, type Page } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

const ARCHIVO_ORDEN = path.join(__dirname, ".ultima-orden.json")

// PNG de 1×1 píxel: la foto de entrega es opcional y aquí solo se prueba que sube y se guarda.
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
)

async function iniciarSesionEnLaTienda(page: Page, correo: string, contrasena: string) {
  await page.goto("/login")
  await page.getByLabel("Correo electrónico").fill(correo)
  await page.getByLabel("Contraseña", { exact: true }).fill(contrasena)
  await page.getByRole("button", { name: "Iniciar sesión" }).click()
  await page.waitForURL(/\/(cuenta|panel)/)
  if (page.url().includes("/cuenta/tiendas")) {
    await page.locator("li", { hasText: "Tienda W006 Prueba" }).getByRole("button", { name: "Continuar" }).click()
    await page.waitForURL(/\/panel/)
  } else if (!page.url().includes("/panel")) {
    await page.goto("/panel")
  }
}

/**
 * Pulsa «Guardar» del panel lateral. Se espera a que termine de deslizarse y se dispara el clic en el elemento:
 * en desarrollo, la insignia de Next.js queda encima del botón y bloquearía un clic con el puntero.
 */
async function guardarPanel(page: Page) {
  await page.waitForTimeout(700)
  await page.getByRole("button", { name: "Guardar" }).dispatchEvent("click")
}

test.describe("Rutas de reparto, guía de remisión y seguimiento (W-019 / A-004)", () => {
  test("del pago de una orden a la entrega con foto, la guía imprimible y el seguimiento público", async ({ page }) => {
    const correo = process.env.E2E_CORREO
    const contrasena = process.env.E2E_CONTRASENA
    test.skip(!correo || !contrasena, "Requiere E2E_CORREO y E2E_CONTRASENA definidos")
    test.setTimeout(120_000)

    await iniciarSesionEnLaTienda(page, correo!, contrasena!)

    // 1. Abrir la última orden creada por la prueba de compra (o la más reciente)
    let numero: string | null = null
    if (fs.existsSync(ARCHIVO_ORDEN)) {
      try {
        numero = JSON.parse(fs.readFileSync(ARCHIVO_ORDEN, "utf8")).numeroOrden
      } catch {
        // sin archivo válido: se usa la más reciente
      }
    }
    await page.goto("/panel/ordenes")
    const enlace = numero ? page.getByRole("link", { name: numero }) : page.locator("ul li").first().getByRole("link")
    await expect(enlace.first()).toBeVisible()
    const numeroOrden = (await enlace.first().innerText()).trim()
    await enlace.first().click()
    await expect(page.getByRole("heading", { name: numeroOrden, level: 1 })).toBeVisible()

    // 2. Registrar el pago y preparar el envío (si todavía no se hizo)
    const pago = page.getByRole("button", { name: "Registrar pago manual" })
    if (await pago.isVisible()) {
      await pago.click()
      await page.getByLabel("Referencia del pago (opcional)").fill("REF-E2E-RUTAS")
      await guardarPanel(page)
      await expect(page.getByRole("button", { name: "Preparar envío" })).toBeVisible()
    }
    const preparar = page.getByRole("button", { name: "Preparar envío" })
    if (await preparar.isVisible()) {
      await preparar.click()
      await guardarPanel(page)
      await expect(page.getByText("Historial")).toBeVisible()
    }

    // El punto de entrega marcado en la compra aparece en el mapa de la orden
    await expect(page.getByRole("application", { name: "Mapa del punto de entrega" })).toBeVisible()

    // 3. Crear una ruta con ese envío
    await page.goto("/panel/rutas/nueva")
    await expect(page.getByRole("heading", { name: "Nueva ruta", level: 1 })).toBeVisible()
    await page.getByLabel("Chofer", { exact: true }).fill("Carlos Quispe")
    await page.getByLabel("Placa del vehículo").fill("abc-123")
    const disponible = page.locator("li", { hasText: numeroOrden }).filter({ has: page.getByRole("button", { name: "Agregar" }) })
    await expect(disponible.first()).toBeVisible()
    await disponible.first().getByRole("button", { name: "Agregar" }).click()
    await page.getByRole("button", { name: "Crear ruta" }).click()

    // 4. Detalle: iniciar la ruta
    await page.waitForURL(/\/panel\/rutas\/[0-9a-f-]{36}$/)
    await expect(page.getByRole("heading", { name: /^Ruta RT-/, level: 1 })).toBeVisible()
    const urlRuta = page.url()
    await page.getByRole("button", { name: "Iniciar ruta" }).click()
    await page.getByRole("button", { name: "Sí, iniciar" }).click()
    await expect(page.getByText("Ruta iniciada")).toBeVisible()
    await expect(page.getByRole("button", { name: "Finalizar ruta" })).toBeVisible()

    // 5. Primer intento fallido, luego entrega con foto
    await page.getByRole("button", { name: "No entregado" }).click()
    await page.getByLabel("Motivo").fill("Nadie en casa")
    await page.getByRole("button", { name: "Registrar intento" }).click()
    await expect(page.getByText(/Intento registrado/)).toBeVisible()

    await page.getByRole("button", { name: "Entregado", exact: true }).click()
    await page.locator('input[type="file"]').setInputFiles({ name: "entrega.png", mimeType: "image/png", buffer: PNG_1X1 })
    await expect(page.getByText("entrega.png")).toBeVisible()
    await page.getByRole("button", { name: "Confirmar entrega" }).click()
    await expect(page.getByText(/Entrega registrada/)).toBeVisible()

    // 6. El historial muestra los tres movimientos, con la foto
    await page.getByRole("button", { name: "Historial" }).click()
    const historial = page.getByRole("list", { name: "Historial del envío" })
    await expect(historial.getByText("Entregado")).toBeVisible()
    await expect(historial.getByText("No se pudo entregar")).toBeVisible()
    await expect(historial.getByText("Nadie en casa")).toBeVisible()
    await expect(historial.getByAltText("Foto de la entrega")).toBeVisible()

    // 7. Guía de remisión lista para imprimir
    const guia = (await page.getByText(/^Guía OT-/).first().innerText()).replace("Guía ", "").trim()
    await page.goto(`${urlRuta}/guia`)
    await expect(page.getByRole("article", { name: /Guía de remisión RT-/ })).toBeVisible()
    await expect(page.getByText("Carlos Quispe").first()).toBeVisible()
    await expect(page.getByText(numeroOrden).first()).toBeVisible()

    // 8. Seguimiento público, sin sesión
    const anonimo = await page.context().browser()!.newContext({ baseURL: test.info().project.use.baseURL })
    const publica = await anonimo.newPage()
    await publica.goto(`/seguimiento?guia=${encodeURIComponent(guia)}`)
    await expect(publica.getByText(guia).first()).toBeVisible()
    await expect(publica.getByRole("list", { name: "Historial del envío" }).getByText("Entregado")).toBeVisible()
    await expect(publica.getByText("Nadie en casa")).toBeVisible()
    await anonimo.close()
  })
})
