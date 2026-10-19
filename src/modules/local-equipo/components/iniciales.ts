/** Iniciales de un nombre para el avatar: primera letra del nombre y del último apellido. */
export const iniciales = (nombre: string): string => {
  const partes = nombre.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : (partes[0]?.[1] ?? ""))).toUpperCase()
}
