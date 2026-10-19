/**
 * Reglas de texto compartidas por los formularios. Son las mismas que valida la API (API del backend,
 * common/validators/is-sql-xss-safe.validator.ts): la API vuelve a validar, esto solo da el aviso al instante.
 */

/** Nombre de persona: letras con tildes y . ' - sueltos; sin números, símbolos ni signos seguidos. */
export const NOMBRE_PERSONA = /^(?!.*(?:[.'-]{2}|\s{2}))[\p{L}\p{M}][\p{L}\p{M}'.\- ]*$/u
export const MENSAJE_NOMBRE_PERSONA = "Solo letras, espacios y . ' - sueltos (sin números ni símbolos)."

const TEXTO_PERMITIDO = /^[\p{L}\p{M}\p{N}\s.,;:()¡!¿?'"%/+\-_&#@$°ºª]*$/u
const RACHA_DE_SIMBOLOS = /[^\p{L}\p{M}\p{N}\s.]{3,}|[^\p{L}\p{M}\p{N}\s]{4,}/u

/** Texto libre (motivos, notas): normal, sin emojis, símbolos raros ni rachas de símbolos. */
export const esTextoLibreValido = (valor: string): boolean => TEXTO_PERMITIDO.test(valor) && !RACHA_DE_SIMBOLOS.test(valor)
export const MENSAJE_TEXTO_LIBRE = "Usa texto normal: sin emojis ni series de símbolos."

/** Un nombre (rol, categoría...) debe tener al menos una letra: "5485+" o "4854" no dicen qué es. */
export const tieneLetra = (valor: string): boolean => /\p{L}/u.test(valor)
export const MENSAJE_CON_LETRA = "Debe incluir al menos una letra."
