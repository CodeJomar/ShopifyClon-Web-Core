import { test, expect } from "@playwright/test"
import { crearCuentaActiva, crearTiendaConProducto } from "./soporte/tienda-de-pruebas"

/**
 * Rediseño (R-001 a R-003): portada pública, mercado con carrito de varias tiendas y un solo pago, y acceso por perfiles
 * (comprador → mercado; propietario → panel general). El mercado y el carrito usan datos de ejemplo en el navegador;
 * el acceso usa la API real con cuentas nuevas `@otemu.test`.
 */
test.describe("Rediseño: zona pública y perfiles", () => {
  test.setTimeout(240_000)

  test("la portada es pública: un visitante sin sesión no es mandado al login", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1, name: /Compra en muchas tiendas/ })).toBeVisible()
    await page.waitForTimeout(2500) // la consulta de sesión (401) no debe redirigir
    await expect(page).toHaveURL(/localhost:\d+\/$/)
    await expect(page.getByRole("link", { name: "Iniciar sesión" }).first()).toBeVisible()
  })

  test("mercado: agrega productos de tres tiendas reales y paga una sola vez", async ({ page, request }) => {
    // Datos reales del mercado (B1): un producto disponible de tres tiendas distintas.
    const lista = await request.get("/api/mercado/productos?tamano=48&orden=recientes")
    const productos = ((await lista.json()).datos.datos as { titulo: string; identificador_url: string; hay_stock: boolean; tienda: { nombre: string; subdominio: string } }[]).filter((p) => p.hay_stock)
    const elegidos: typeof productos = []
    for (const p of productos) if (!elegidos.some((e) => e.tienda.subdominio === p.tienda.subdominio) && elegidos.length < 3) elegidos.push(p)
    expect(elegidos.length, "el mercado debe tener productos de al menos tres tiendas").toBe(3)

    await page.goto("/mercado")
    await page.getByPlaceholder("Buscar productos o tiendas").fill(elegidos[0].titulo)
    await page.getByRole("button", { name: "Buscar" }).click()
    await expect(page.getByRole("heading", { level: 1, name: /Resultados para/ })).toBeVisible()

    for (const p of elegidos) {
      await page.goto(`/mercado/tienda/${p.tienda.subdominio}/${p.identificador_url}`)
      await page.getByRole("button", { name: "Agregar al carrito" }).click()
      await expect(page.getByText("Agregado al carrito")).toBeVisible()
    }

    await page.goto("/carrito")
    for (const p of elegidos) await expect(page.getByRole("region", { name: `Productos de ${p.tienda.nombre}` })).toBeVisible()
    await page.getByRole("link", { name: "Continuar con la compra" }).click()

    await page.getByLabel("Nombre y apellido").fill("Ana Compradora")
    await page.getByLabel("Correo electrónico").fill("ana@otemu.test")
    const direccion = page.getByLabel("Dirección", { exact: true })
    if (await direccion.isVisible()) {
      await direccion.fill("Av. Larco 123, Miraflores")
      await page.getByRole("application", { name: /Mapa/ }).click()
    }
    await expect(page.getByText("Tarjeta: un solo pago")).toBeVisible()
    await page.getByRole("button", { name: /^Pagar S\// }).click()

    await page.waitForURL(/\/mis-pedidos\//)
    await expect(page.getByText("Pago recibido: un solo pago para todo el pedido")).toBeVisible()
    for (const p of elegidos) await expect(page.getByRole("link", { name: p.tienda.nombre })).toBeVisible()
  })

  test("perfiles: el comprador entra al mercado y, al abrir una tienda, ve su panel general", async ({ browser, baseURL }) => {
    const contexto = await browser.newContext({ baseURL })
    const page = await contexto.newPage()
    const cuenta = await crearCuentaActiva(contexto.request, "rd")

    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill(cuenta.correo)
    await page.getByLabel("Contraseña", { exact: true }).fill(cuenta.contrasena)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await page.waitForURL(/\/mercado/, { timeout: 30_000 })
    await page.getByRole("button", { name: "Menú de tu cuenta" }).click()
    await expect(page.getByRole("menuitem", { name: "Vender en OTemu" })).toBeVisible()
    await page.keyboard.press("Escape")

    await crearTiendaConProducto(contexto.request)
    await page.goto("/propietario")
    await expect(page.getByRole("heading", { name: "Panel general", level: 1 })).toBeVisible({ timeout: 40_000 })
    await expect(page.getByRole("button", { name: "Administrar" })).toBeVisible()
    await contexto.close()
  })
})
