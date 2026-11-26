// RUC del Perú: 11 dígitos con prefijo 10 (persona natural) o 20 (persona jurídica) y dígito verificador de módulo 11.
// Mismas reglas que el servidor (que decide); aquí se avisa antes de enviar. Solo valida el formato: no consulta a la SUNAT.

const PESOS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

/** Quita espacios y guiones, como hace el servidor al recibirlo. */
export const normalizarRuc = (valor: string): string => valor.replace(/[\s-]/g, "")

/** Texto del primer problema del RUC, o null si es válido. */
export function mensajeRuc(valor: string): string | null {
  const ruc = normalizarRuc(valor)
  if (!/^\d+$/.test(ruc)) return "El RUC solo lleva números."
  if (ruc.length !== 11) return "El RUC tiene 11 dígitos."
  if (!["10", "20"].includes(ruc.slice(0, 2))) return "El RUC debe empezar con 10 (persona natural) o 20 (empresa)."
  const suma = PESOS.reduce((total, peso, i) => total + peso * Number(ruc[i]), 0)
  const resto = suma % 11
  const digito = (11 - resto) % 10 // 10 → 0 y 11 → 1
  if (digito !== Number(ruc[10])) return "El RUC no es válido: revisa el último dígito."
  return null
}
