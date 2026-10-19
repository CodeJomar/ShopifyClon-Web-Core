/** Claves de las denominaciones del arqueo (billetes b…, monedas m…; m050 = S/ 0.50). */
export const DENOMINACIONES_ARQUEO = ["b200", "b100", "b50", "b20", "b10", "m5", "m2", "m1", "m050", "m020", "m010"] as const

export type DenominacionArqueo = (typeof DENOMINACIONES_ARQUEO)[number]

/** Cantidad de billetes y monedas contados por denominación. */
export type ConteoArqueo = Partial<Record<DenominacionArqueo, number>>
