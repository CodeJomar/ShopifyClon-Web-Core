/** Metadatos de paginación que acompañan a toda respuesta de lista paginada. */
export type MetaPaginacion = {
  total_registros: number
  pagina_actual: number
  total_paginas: number
  limite_por_pagina: number
  tiene_pagina_siguiente: boolean
  tiene_pagina_anterior: boolean
}

export const META_VACIA: MetaPaginacion = {
  total_registros: 0,
  pagina_actual: 1,
  total_paginas: 1,
  limite_por_pagina: 10,
  tiene_pagina_siguiente: false,
  tiene_pagina_anterior: false,
}
