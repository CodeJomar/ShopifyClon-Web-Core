/**
 * Destino tras iniciar sesión. Solo rutas internas: empiezan por "/" y no son "//" ni "/\"
 * (evita redirecciones abiertas a otros sitios). Si no es válido, va a /cuenta.
 */
export function destinoSeguro(siguiente: string | undefined | null): string {
  if (!siguiente) return "/cuenta"
  if (!siguiente.startsWith("/")) return "/cuenta"
  if (siguiente.startsWith("//") || siguiente.startsWith("/\\")) return "/cuenta"
  // Caracteres de control y espacios no son rutas válidas.
  if (/[\u0000-\u001f\u007f\s]/.test(siguiente)) return "/cuenta"
  return siguiente
}
