import { notFound } from "next/navigation"
import { esErrorApi } from "@/lib/api/error-api"
import { obtenerTienda } from "@/modules/vitrina/actions/vitrina.actions"
import { OrdenPublicaView } from "@/modules/checkout/views/orden-publica-view"

export default async function OrdenPage({ params }: { params: Promise<{ subdominio: string; token: string }> }) {
  const { subdominio, token } = await params
  let correoContacto: string
  try {
    correoContacto = (await obtenerTienda(subdominio)).correo_contacto
  } catch (error) {
    if (esErrorApi(error) && error.estado === 404) notFound()
    throw error
  }
  return <OrdenPublicaView subdominio={subdominio} token={token} correoContacto={correoContacto} />
}
