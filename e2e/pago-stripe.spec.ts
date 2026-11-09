import { test, expect, type Page } from "@playwright/test"

/**
 * Pago con tarjeta (W-020) contra la API real con Stripe en modo de prueba. Usa las tarjetas de prueba publicadas por Stripe:
 * 4242 4242 4242 4242 (aprobada) y 4000 0000 0000 0002 (rechazada). El webhook lo reenvía el contenedor stripe-cli.
 */

/** Compra de invitado con «Tarjeta (Stripe)» hasta quedar en la página pública de la orden con el pago pendiente. */
async function comprarConTarjeta(page: Page) {
  await page.goto("/tienda/tienda-w006-prueba/productos/plato-w008-ui")
  await expect(page.getByRole("heading", { name: "Plato W008 UI", level: 1 })).toBeVisible()
  await page.getByRole("button", { name: "Agregar al carrito" }).click()
  await expect(page.getByText("Producto agregado al carrito")).toBeVisible()

  await page.goto("/tienda/tienda-w006-prueba/carrito")
  await page.getByRole("link", { name: "Continuar con la compra" }).click()
  await page.waitForURL(/\/tienda\/tienda-w006-prueba\/checkout/)
  await expect(page.getByRole("heading", { name: "Finaliza tu compra", level: 1 })).toBeVisible()

  await page.getByLabel("Correo").fill("fola03peralta+stripe@gmail.com")
  await page.getByLabel("Nombre y apellido").fill("Comprador Stripe E2E")
  await page.getByLabel("Quien recibe").fill("Comprador Stripe E2E")
  await page.getByLabel("Dirección").fill("Av. Larco 123, Dpto 402")
  await page.getByLabel("Ciudad").fill("Lima")
  await page.getByLabel("Departamento o provincia").fill("Lima")
  await page.getByLabel("Código postal").fill("15074")
  await page.getByRole("application", { name: "Mapa para marcar el punto de entrega" }).click()
  await page.getByRole("button", { name: "Continuar" }).click()

  await expect(page.getByRole("heading", { name: "Confirma tu compra", level: 1 })).toBeVisible()
  await page.getByRole("radio", { name: /Tarjeta \(Stripe\)/ }).click()
  await page.getByRole("button", { name: "Confirmar compra" }).click()

  await page.waitForURL(/\/tienda\/tienda-w006-prueba\/orden\//, { timeout: 30_000 })
  await expect(page.getByText("Pago pendiente")).toBeVisible()
}

/** Abre el formulario de Stripe y escribe la tarjeta de prueba (el formulario vive en un iframe de js.stripe.com). */
async function escribirTarjeta(page: Page, numero: string) {
  await page.getByRole("button", { name: "Pagar con tarjeta" }).click()
  const marco = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
  await marco.getByPlaceholder("1234 1234 1234 1234").fill(numero)
  await marco.getByPlaceholder("MM / AA").fill("12 / 34")
  await marco.getByPlaceholder("CVC").fill("123")
}

test.describe("Pago con tarjeta (Stripe, modo de prueba) (W-020)", () => {
  test.setTimeout(150_000)

  test("tarjeta aprobada: la orden pasa a pagada cuando llega el webhook", async ({ page }) => {
    await comprarConTarjeta(page)
    await escribirTarjeta(page, "4242424242424242")
    await page.getByRole("button", { name: "Pagar", exact: true }).click()
    await expect(page.getByText("Pago pendiente")).toBeHidden({ timeout: 60_000 })
    await expect(page.getByText("Pagado").first()).toBeVisible()
  })

  test("tarjeta rechazada: muestra el motivo y la orden sigue pendiente", async ({ page }) => {
    await comprarConTarjeta(page)
    await escribirTarjeta(page, "4000000000000002")
    await page.getByRole("button", { name: "Pagar", exact: true }).click()
    await expect(page.getByText(/rechaz|declin/i).first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText("Pago pendiente")).toBeVisible()
  })
})
