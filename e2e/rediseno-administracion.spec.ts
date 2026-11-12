import { test, expect } from "@playwright/test"
import fs from "node:fs"
import { comprarComoInvitado, crearCuentaActiva, crearTiendaConProducto } from "./soporte/tienda-de-pruebas"

/**
 * Panel general del propietario (B7) y administración de plataforma (B8) con la API real. El administrador de pruebas
 * (`admin.prueba@otemu.test`) toma su contraseña del documento de datos de prueba; sin ella, esa parte se omite.
 */
test.describe("Rediseño: panel del propietario y administración", () => {
  test.setTimeout(240_000)

  test("propietario: el panel general muestra sus tiendas con cifras reales", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL })
    const page = await ctx.newPage()
    const cuenta = await crearCuentaActiva(ctx.request, "pg")
    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill(cuenta.correo)
    await page.getByLabel("Contraseña", { exact: true }).fill(cuenta.contrasena)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await page.waitForURL(/\/mercado/, { timeout: 60_000 })
    const tienda = await crearTiendaConProducto(ctx.request)
    // Una compra de invitado deja una orden pendiente por preparar/pagar en la tienda.
    const anonimo = await browser.newContext({ baseURL })
    await comprarComoInvitado(anonimo.request, tienda)
    await anonimo.close()

    await page.goto("/propietario")
    await expect(page.getByRole("heading", { name: "Panel general", level: 1 })).toBeVisible({ timeout: 40_000 })
    await expect(page.getByText("Ventas netas, últimos 30 días")).toBeVisible({ timeout: 30_000 })
    await expect(page.getByRole("heading", { name: "Ventas por tienda" })).toBeVisible()
    await expect(page.getByText(`Tienda E2E`).first()).toBeVisible()
    await ctx.close()
  })

  test("administración: tiendas y usuarios reales, y bloqueo de una cuenta con motivo", async ({ browser, baseURL }) => {
    const doc = fs.readFileSync("C:/UTP-Proyectos/Shopify-Clon-Core/Desarrollo/docs/orquestacion-frontend/datos-de-prueba.md", "utf8")
    const clave = /Contrase[ñn]a[^`\n]*`([^`]+)`/i.exec(doc)?.[1]
    test.skip(!clave, "sin contraseña documentada para el administrador de pruebas")

    // Una cuenta nueva para bloquearla sin tocar cuentas de otros.
    const aparte = await browser.newContext({ baseURL })
    const victima = await crearCuentaActiva(aparte.request, "bl")
    await aparte.close()

    const ctx = await browser.newContext({ baseURL })
    const page = await ctx.newPage()
    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill("admin.prueba@otemu.test")
    await page.getByLabel("Contraseña", { exact: true }).fill(clave!)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await page.waitForURL(/\/plataforma/, { timeout: 60_000 })
    await expect(page.getByRole("heading", { name: "Resumen de la plataforma", level: 1 })).toBeVisible({ timeout: 40_000 })

    await page.goto("/plataforma/tiendas")
    await expect(page.getByRole("heading", { name: "Tiendas", level: 1 })).toBeVisible({ timeout: 40_000 })
    await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 30_000 })

    await page.goto("/plataforma/usuarios")
    await page.getByRole("searchbox", { name: "Buscar por nombre o correo" }).fill(victima.correo)
    const fila = page.getByRole("row", { name: new RegExp(victima.correo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })
    await expect(fila).toBeVisible({ timeout: 30_000 })
    await fila.getByRole("button", { name: "Bloquear" }).click()
    await page.getByLabel("Motivo").fill("Prueba automática de bloqueo")
    await page.getByRole("button", { name: "Bloquear cuenta" }).click()
    await expect(fila.getByText("Bloqueado")).toBeVisible({ timeout: 30_000 })

    await page.goto("/plataforma/auditoria")
    await expect(page.getByRole("heading", { name: "Auditoría", level: 1 })).toBeVisible({ timeout: 40_000 })
    await expect(page.getByText("usuario bloqueado").first()).toBeVisible({ timeout: 30_000 })
    // Se deja la cuenta como estaba.
    await page.goto("/plataforma/usuarios")
    await page.getByRole("searchbox", { name: "Buscar por nombre o correo" }).fill(victima.correo)
    await fila.getByRole("button", { name: "Desbloquear" }).click()
    await page.getByRole("button", { name: "Desbloquear" }).last().click()
    await expect(fila.getByText("Activo")).toBeVisible({ timeout: 30_000 })
    await ctx.close()
  })
})
