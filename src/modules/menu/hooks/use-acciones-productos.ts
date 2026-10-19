"use client"

import * as React from "react"

import type { ProductoDto } from "@/dtos/menu"
import { toastResponse } from "@/shared/utils/toast-response"

import { actualizarProducto, asignarGrupos, crearProducto, eliminarProducto } from "../actions/menu.actions"
import type { ProductoFormValues, ProductoMenu } from "../schema"

/** Crear, editar y eliminar productos. `refrescar` vuelve a leer el catálogo tras cada cambio. */
export function useAccionesProductos(refrescar: () => void) {
  /**
   * Crea o actualiza un producto y, si cambió, su lista de grupos de personalización.
   * Devuelve true si todo se guardó (el formulario se cierra solo en ese caso).
   */
  const guardarProducto = React.useCallback(
    async (values: ProductoFormValues, producto?: ProductoMenu): Promise<boolean> => {
      const imagen = values.imagenUrl.trim()
      const base = {
        id_categoria: values.categoriaId,
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim(),
        precio: values.precio.replace(",", "."),
        disponible: values.disponible,
        // Al editar, una cadena vacía quita la imagen; al crear, sin imagen no se envía el campo
        ...(producto || imagen ? { imagen_url: imagen } : {}),
      }
      const gruposAnteriores = producto?.grupos_modificadores.map((g) => g.id_grupo) ?? []
      const gruposCambiaron =
        values.grupos.length !== gruposAnteriores.length || values.grupos.some((id) => !gruposAnteriores.includes(id))

      const operacion = (async () => {
        const guardado = producto ? await actualizarProducto(producto.id_producto, base) : await crearProducto(base)
        if (!guardado.isOk()) return guardado
        const idProducto = (guardado.data as ProductoDto).id_producto
        if (gruposCambiaron) {
          const asignacion = await asignarGrupos(idProducto, {
            grupos: values.grupos.map((id_grupo, orden_visual) => ({ id_grupo, orden_visual })),
          })
          if (!asignacion.isOk()) return asignacion
        }
        return guardado
      })()

      const respuesta = await toastResponse(operacion, {
        loading: producto ? "Guardando los cambios…" : "Agregando el producto…",
        success: producto ? `"${base.nombre}" actualizado` : `"${base.nombre}" agregado al menú`,
        error: producto ? "No se pudo guardar el producto" : "No se pudo agregar el producto",
      })
      // Aunque la asignación de grupos falle, el producto ya existe: se vuelve a leer el catálogo
      refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  const quitarProducto = React.useCallback(
    async (producto: ProductoMenu): Promise<boolean> => {
      const respuesta = await toastResponse(eliminarProducto(producto.id_producto), {
        loading: "Eliminando el producto…",
        success: `"${producto.nombre}" eliminado`,
        error: "No se pudo eliminar el producto",
      })
      if (respuesta.isOk()) refrescar()
      return respuesta.isOk()
    },
    [refrescar],
  )

  return { guardarProducto, quitarProducto }
}
