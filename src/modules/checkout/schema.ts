import { z } from "zod"

/** Datos del comprador y, si el carrito requiere envío, la dirección y la tarifa (límites de CheckoutRequest). */
export function crearDatosCheckoutSchema(requiereEnvio: boolean) {
  const obligatorioSiEnvio = (max: number, mensaje: string) =>
    z.string().trim().max(max, `Este campo no puede pasar de ${max} caracteres.`).refine((v) => !requiereEnvio || v.length > 0, mensaje)

  return z.object({
    correo_cliente: z.string().trim().email("Escribe un correo válido.").max(255, "El correo es demasiado largo."),
    nombre_cliente: z.string().trim().min(1, "Escribe tu nombre.").max(150, "El nombre no puede pasar de 150 caracteres."),
    telefono_cliente: z.string().trim().max(30, "El teléfono no puede pasar de 30 caracteres."),
    direccion_nombre_contacto: obligatorioSiEnvio(150, "Escribe el nombre de quien recibe."),
    direccion_telefono: z.string().trim().max(30, "El teléfono no puede pasar de 30 caracteres."),
    direccion_linea1: obligatorioSiEnvio(200, "Escribe la dirección."),
    direccion_linea2: z.string().trim().max(200, "La referencia no puede pasar de 200 caracteres."),
    ciudad: obligatorioSiEnvio(100, "Escribe la ciudad."),
    estado_provincia: obligatorioSiEnvio(100, "Escribe el departamento o provincia."),
    codigo_postal: obligatorioSiEnvio(20, "Escribe el código postal."),
    pais: obligatorioSiEnvio(60, "Escribe el país."),
    // Punto de entrega en el mapa (ENV-007): sin él no hay a dónde llevar el pedido.
    latitud: z.number().min(-90).max(90).nullable().refine((v) => !requiereEnvio || v !== null, "Marca en el mapa el punto de entrega."),
    longitud: z.number().min(-180).max(180).nullable(),
    tarifa_envio_id: requiereEnvio ? z.string().min(1, "Elige una tarifa de envío.") : z.string(),
  })
}

export type DatosCheckoutValues = z.infer<ReturnType<typeof crearDatosCheckoutSchema>>
