import { test, expect } from "@playwright/test"
import { comprarComoInvitado, crearCuentaActiva, crearTiendaConProducto } from "./soporte/tienda-de-pruebas"

/**
 * Tiempo real (W-022) contra la API real: el comerciante tiene el panel abierto y el comprador la página de su orden, cada uno en su
 * propio contexto de navegador. Necesita el API con `CORS_ORIGENES_PERMITIDOS` que incluya el origen de la web y la web con
 * `NEXT_PUBLIC_WS_URL`. La tienda, el producto y las órdenes se crean por la API con una cuenta nueva (no la principal).
 */
test.describe("Tiempo real (W-022)", () => {
  test.setTimeout(240_000)

  test("el panel avisa de una orden nueva y de su pago, y la página del comprador pasa a pagada sola", async ({ browser, baseURL }) => {
    // --- Comerciante: cuenta, tienda con producto digital y panel de órdenes abierto
    const contextoComerciante = await browser.newContext({ baseURL })
    const panel = await contextoComerciante.newPage()
    const cuenta = await crearCuentaActiva(contextoComerciante.request, "tr")
    const login = await contextoComerciante.request.post("/api/auth/login", {
      data: { correo_electronico: cuenta.correo, contrasena: cuenta.contrasena },
    })
    expect(login.ok(), "login").toBeTruthy()
    const tienda = await crearTiendaConProducto(contextoComerciante.request)

    await panel.goto("/panel/ordenes")
    await expect(panel.getByRole("heading", { name: "Órdenes", level: 1 })).toBeVisible({ timeout: 60_000 })
    await expect(panel.getByText("En vivo")).toBeVisible({ timeout: 30_000 })

    // --- Comprador: compra como invitado (por la API) y abre la página de su orden
    const contextoComprador = await browser.newContext({ baseURL })
    // El aviso del panel dura pocos segundos: se empieza a esperarlo ANTES de crear la orden.
    const avisoOrdenNueva = expect(panel.getByText("Nueva orden").first()).toBeVisible({ timeout: 30_000 })
    const orden = await comprarComoInvitado(contextoComprador.request, tienda)
    const comprador = await contextoComprador.newPage()
    await comprador.goto(`/tienda/${tienda.subdominio}/orden/${orden.tokenAcceso}`)
    await expect(comprador.getByText("Pago pendiente")).toBeVisible()
    await expect(comprador.getByText("En vivo")).toBeVisible({ timeout: 30_000 })

    // 1. La orden nueva aparece en el panel sin recargar, con su aviso
    await avisoOrdenNueva
    await expect(panel.getByRole("link", { name: orden.numeroOrden })).toBeVisible({ timeout: 20_000 })

    // 2. El comerciante registra el pago manual: aviso en su panel y el comprador lo ve sin tocar nada
    const pago = await contextoComerciante.request.post(`/api/panel/ordenes/${orden.ordenId}/pagos/manual`, { data: { referencia: "E2E-TR" } })
    expect(pago.ok(), "pago manual").toBeTruthy()
    await expect(panel.getByText("Orden pagada").first()).toBeVisible({ timeout: 20_000 })
    await expect(comprador.getByText("Pago pendiente")).toBeHidden({ timeout: 20_000 })
    await expect(comprador.getByText("Pagado").first()).toBeVisible()

    await contextoComerciante.close()
    await contextoComprador.close()
  })

  test("sin conexión en vivo la página de la orden sigue funcionando por consulta", async ({ browser, baseURL }) => {
    const contextoComerciante = await browser.newContext({ baseURL })
    const cuenta = await crearCuentaActiva(contextoComerciante.request, "tr")
    await contextoComerciante.request.post("/api/auth/login", { data: { correo_electronico: cuenta.correo, contrasena: cuenta.contrasena } })
    const tienda = await crearTiendaConProducto(contextoComerciante.request)

    const contextoComprador = await browser.newContext({ baseURL })
    const orden = await comprarComoInvitado(contextoComprador.request, tienda)
    const comprador = await contextoComprador.newPage()
    // El socket se corta apenas abre: la pantalla debe indicarlo y seguir usable.
    await comprador.routeWebSocket(/\/ws$/, (ws) => ws.close())
    await comprador.goto(`/tienda/${tienda.subdominio}/orden/${orden.tokenAcceso}`)
    await expect(comprador.getByText("Pago pendiente")).toBeVisible()
    await expect(comprador.getByText(/Reconectando|Sin conexión en vivo|Conectando/)).toBeVisible({ timeout: 20_000 })

    await contextoComerciante.request.post(`/api/panel/ordenes/${orden.ordenId}/pagos/manual`, { data: { referencia: "E2E-TR2" } })
    // La consulta manual («Consultar de nuevo») sigue mostrando el estado real
    await comprador.getByRole("button", { name: "Consultar de nuevo" }).click()
    await expect(comprador.getByText("Pagado").first()).toBeVisible({ timeout: 20_000 })

    await contextoComerciante.close()
    await contextoComprador.close()
  })
})
