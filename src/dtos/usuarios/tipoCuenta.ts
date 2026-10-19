export const TIPOS_CUENTA = ["OWNER", "EMPLOYEE"] as const

export type TipoCuenta = (typeof TIPOS_CUENTA)[number]
