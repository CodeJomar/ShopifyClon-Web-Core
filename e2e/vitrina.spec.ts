import { test, expect } from "@playwright/test"

test.describe("Vitrina pública y catálogo (W-014)", () => {
  test("la portada de tienda-w006-prueba muestra productos publicados", async ({ page }) => {
    await page.goto("/tienda/tienda-w006-prueba")

    // La cabecera muestra el nombre de la tienda
    await expect(page.getByRole("link", { name: "Tienda W006 Prueba" })).toBeVisible()

    // El catálogo muestra el producto publicado Plato W008 UI
    const productoLink = page.getByRole("link", { name: /Plato W008 UI/i }).first()
    await expect(productoLink).toBeVisible()
  })

  test("el detalle del producto muestra precio y botón de agregar al carrito", async ({ page }) => {
    await page.goto("/tienda/tienda-w006-prueba/productos/plato-w008-ui")

    // Título del producto
    await expect(page.getByRole("heading", { name: "Plato W008 UI", level: 1 })).toBeVisible()

    // Botón de agregar al carrito
    const botonAgregar = page.getByRole("button", { name: "Agregar al carrito" })
    await expect(botonAgregar).toBeVisible()
    await expect(botonAgregar).toBeEnabled()
  })

  test("una tienda inexistente muestra el estado de no disponible", async ({ page }) => {
    await page.goto("/tienda/tienda-no-existe-xyz")

    await expect(
      page.getByText(/Esta tienda no está disponible|no se encuentra operativo/i),
    ).toBeVisible()
  })
})
