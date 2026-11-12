/** Matiz (0–359) estable para una tienda, calculado de su subdominio: da identidad visual mientras no haya logo ni fotos. */
export function tonoDe(clave: string): number {
  let h = 0
  for (let i = 0; i < clave.length; i++) h = (h * 31 + clave.charCodeAt(i)) % 360
  return h
}
