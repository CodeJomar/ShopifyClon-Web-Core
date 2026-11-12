import { test, expect, type Page } from "@playwright/test"
import { leerCodigo } from "./soporte/codigos-de-prueba"

/**
 * Seguridad de la cuenta (W-021 / A-007) contra la API real. Cada prueba crea sus propias cuentas con correo `@otemu.test`
 * (el API local corre con `MAIL_ENABLED=false`, así que no sale ningún correo) y lee los códigos de la base de pruebas con
 * `soporte/codigos-de-prueba.ts`. Nunca se usa la cuenta principal: el bloqueo o el cambio de contraseña la dejarían inservible.
 */
const CONTRASENA = "Zorro-Verde-Lago-2026"

type Cuenta = { correo: string; contrasena: string }

/** Crea y activa una cuenta nueva por la API (mismo proxy que usa la web). */
async function crearCuenta(page: Page): Promise<Cuenta> {
  const correo = `w021-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}@otemu.test`
  const registro = await page.request.post("/api/auth/registro", {
    data: { correo_electronico: correo, contrasena: CONTRASENA, nombres: "Prueba", apellidos: "Seguridad" },
  })
  expect(registro.status(), "registro").toBe(201)
  const codigo = await leerCodigo(correo, "ACTIVACION_CUENTA")
  const activacion = await page.request.post("/api/auth/activar", { data: { correo_electronico: correo, codigo } })
  expect(activacion.ok(), "activación").toBeTruthy()
  return { correo, contrasena: CONTRASENA }
}

/** Inicia sesión por la pantalla. Si la API limita las peticiones por IP (GEN-429), espera y reintenta. */
async function iniciarSesion(page: Page, cuenta: Cuenta, contrasena = cuenta.contrasena) {
  for (let intento = 0; intento < 3; intento++) {
    await page.goto("/login")
    await page.getByLabel("Correo electrónico").fill(cuenta.correo)
    await page.getByLabel("Contraseña", { exact: true }).fill(contrasena)
    await page.getByRole("button", { name: "Iniciar sesión" }).click()
    await page.waitForTimeout(1500)
    if (!(await page.getByText("Demasiados intentos").isVisible())) return
    await page.waitForTimeout(62_000)
  }
}

/** Escribe los 6 dígitos en el campo de código (un casillero por dígito). */
async function escribirCodigo(page: Page, codigo: string) {
  const casilleros = page.locator('input[inputmode="numeric"], input[maxlength="1"]')
  await casilleros.first().click()
  await page.keyboard.type(codigo, { delay: 40 })
}

test.describe("Seguridad de la cuenta (W-021)", () => {
  test.setTimeout(180_000)

  test("una contraseña demasiado común se rechaza junto al campo en el registro (USR-015)", async ({ page }) => {
    await page.goto("/registro")
    await page.getByLabel("Nombres").fill("Prueba")
    await page.getByLabel("Apellidos").fill("Comun")
    await page.getByLabel("Correo electrónico").fill(`w021-comun-${Date.now().toString(36)}@otemu.test`)
    await page.getByLabel("Contraseña", { exact: true }).fill("Password123")
    await page.getByRole("button", { name: "Crear cuenta" }).click()
    await expect(page.getByText(/demasiado común|muy común|común/i).first()).toBeVisible()
    await expect(page).toHaveURL(/\/registro/)
  })

  test("la pantalla de activación acepta el código y lleva al login", async ({ page }) => {
    const correo = `w021-act-${Date.now().toString(36)}@otemu.test`
    const registro = await page.request.post("/api/auth/registro", {
      data: { correo_electronico: correo, contrasena: CONTRASENA, nombres: "Prueba", apellidos: "Activacion" },
    })
    expect(registro.status()).toBe(201)
    const codigo = await leerCodigo(correo, "ACTIVACION_CUENTA")
    await page.goto(`/activar-cuenta?correo=${encodeURIComponent(correo)}`)
    await escribirCodigo(page, codigo)
    await page.getByRole("button", { name: "Activar cuenta" }).click()
    await page.waitForURL(/\/login/)
    await iniciarSesion(page, { correo, contrasena: CONTRASENA })
    await page.waitForURL(/\/(cuenta|panel)/)
  })

  test("dos pasos: se activa en Mi cuenta y el login pide el código; un código malo no entra", async ({ page }) => {
    const cuenta = await crearCuenta(page)

    // Login normal (todavía sin dos pasos) → entra
    await iniciarSesion(page, cuenta)
    await page.waitForURL(/\/(cuenta|panel)/)

    // Activar dos pasos en Mi cuenta, confirmando la contraseña
    await page.goto("/cuenta")
    const seccion = page.getByRole("region", { name: "Verificación en dos pasos" })
    await expect(seccion.getByText("Desactivada")).toBeVisible()
    await seccion.getByRole("switch").click()
    await seccion.getByLabel("Contraseña actual").fill(cuenta.contrasena)
    await seccion.getByRole("button", { name: "Activar" }).click()
    await expect(seccion.getByText("Activada")).toBeVisible()

    // Cerrar sesión en la web y volver a entrar: ahora pide el código
    await page.getByRole("button", { name: "Cerrar sesión", exact: true }).click()
    await page.waitForURL(/\/login/)
    await iniciarSesion(page, cuenta)
    await expect(page.getByRole("heading", { name: "Revisa tu correo" })).toBeVisible()
    await expect(page).toHaveURL(/\/login/)

    // Código incorrecto
    await escribirCodigo(page, "000000")
    await page.getByRole("button", { name: "Verificar y entrar" }).click()
    await expect(page.getByText("El código no es válido o venció.")).toBeVisible()

    // Código correcto
    const codigo = await leerCodigo(cuenta.correo, "SEGUNDO_FACTOR")
    await escribirCodigo(page, codigo)
    await page.getByRole("button", { name: "Verificar y entrar" }).click()
    await page.waitForURL(/\/(cuenta|panel)/)
    await page.goto("/cuenta")
    await expect(page.getByRole("region", { name: "Verificación en dos pasos" }).getByText("Activada")).toBeVisible()
  })

  test("cuenta bloqueada tras 5 fallos y desbloqueo con el código", async ({ page }) => {
    const cuenta = await crearCuenta(page)

    for (let i = 0; i < 5; i++) {
      await iniciarSesion(page, cuenta, "Clave-Equivocada-77")
      await expect(page.getByText(/No pudimos iniciar sesión|Tu cuenta está bloqueada/).first()).toBeVisible()
    }
    // Aunque la contraseña ahora sea correcta, la cuenta sigue bloqueada
    await iniciarSesion(page, cuenta)
    await expect(page.getByText("Tu cuenta está bloqueada", { exact: true })).toBeVisible()
    await expect(page.getByText(/Revisa tu correo para desbloquearla/)).toBeVisible()

    // «Tengo un código de desbloqueo» → pantalla de desbloqueo con el correo ya escrito
    await page.getByRole("button", { name: "Tengo un código de desbloqueo" }).click()
    await page.waitForURL(/\/desbloquear/)
    await expect(page.getByLabel("Correo electrónico")).toHaveValue(cuenta.correo)
    const codigo = await leerCodigo(cuenta.correo, "DESBLOQUEO_CUENTA")
    await escribirCodigo(page, codigo)
    await page.getByRole("button", { name: "Desbloquear cuenta" }).click()
    await page.waitForURL(/\/login.*aviso=desbloqueada/)
    await expect(page.getByText("Cuenta desbloqueada, ya puedes iniciar sesión.")).toBeVisible()

    // Y ahora sí entra
    await iniciarSesion(page, cuenta)
    await page.waitForURL(/\/(cuenta|panel)/)
  })

  test("cambiar la contraseña cierra la sesión y lleva al login con un aviso; cerrar sesión en todos los dispositivos también", async ({ page }) => {
    const cuenta = await crearCuenta(page)
    await iniciarSesion(page, cuenta)
    await page.waitForURL(/\/(cuenta|panel)/)
    await page.goto("/cuenta")

    await expect(page.getByText("Al cambiarla se cerrará tu sesión en todos los dispositivos.")).toBeVisible()
    // Una contraseña común se rechaza junto al campo y no cierra la sesión
    await page.getByLabel("Contraseña actual").fill(cuenta.contrasena)
    await page.getByLabel("Contraseña nueva", { exact: true }).fill("Password123")
    await page.getByLabel("Confirma la contraseña nueva").fill("Password123")
    await page.getByRole("button", { name: "Cambiar contraseña" }).click()
    await expect(page.getByText(/común/i).first()).toBeVisible()
    await expect(page).toHaveURL(/\/cuenta/)

    const nueva = "Cielo-Azul-Monte-2027"
    await page.getByLabel("Contraseña nueva", { exact: true }).fill(nueva)
    await page.getByLabel("Confirma la contraseña nueva").fill(nueva)
    await page.getByRole("button", { name: "Cambiar contraseña" }).click()
    await page.waitForURL(/\/login.*aviso=contrasena/)
    await expect(page.getByText("Contraseña actualizada. Vuelve a iniciar sesión.")).toBeVisible()

    // La contraseña vieja ya no sirve y la nueva sí
    await iniciarSesion(page, cuenta)
    await expect(page.getByText("No pudimos iniciar sesión")).toBeVisible()
    await iniciarSesion(page, cuenta, nueva)
    await page.waitForURL(/\/(cuenta|panel)/)

    // Cerrar sesión en todos los dispositivos
    await page.goto("/cuenta")
    await page.getByRole("button", { name: "Cerrar sesión en todos los dispositivos" }).click()
    await page.getByRole("button", { name: "Sí, cerrar todas" }).click()
    await page.waitForURL(/\/login.*aviso=sesiones/)
    await expect(page.getByText(/Cerramos tu sesión en todos los dispositivos/)).toBeVisible()
    await page.goto("/cuenta")
    await page.waitForURL(/\/login/)
  })
})
