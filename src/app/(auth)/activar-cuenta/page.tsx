import { ActivarCuentaView } from "@/modules/auth"

export const metadata = {
  title: "Activar cuenta | Coffy Flow",
  description: "Define tu contraseña para activar tu cuenta de acceso.",
  // El enlace lleva un token de un solo uso: no se filtra a otros sitios por el encabezado Referer.
  referrer: "no-referrer" as const,
}

export default async function ActivarCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>
}) {
  const { token } = await searchParams
  return <ActivarCuentaView token={Array.isArray(token) ? token[0] : token} />
}
