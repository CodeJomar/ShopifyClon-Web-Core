import { ActivarCuentaView } from "@/modules/auth"

export const metadata = {
  title: "Activar cuenta | OTemu",
  description: "Escribe el código de 6 dígitos para activar tu cuenta.",
}

export default async function ActivarCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string | string[] }>
}) {
  const { correo } = await searchParams
  return <ActivarCuentaView correo={Array.isArray(correo) ? correo[0] : correo} />
}
