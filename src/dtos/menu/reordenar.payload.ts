import type { UUID } from "../core/helpers"

/** Orden deseado (`PATCH /menu/categorias-orden`): el primer id se muestra primero. */
export type ReordenarPayload = {
  ids: UUID[]
}
