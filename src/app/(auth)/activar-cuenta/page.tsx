import { ActivarCuentaView } from "@/modules/auth"

export const metadata = {
  title: "Activar cuenta | OTemu",
  description: "Escribe el código de 6 dígitos para activar tu cuenta.",
}

export default async function ActivarCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string | string[]; siguiente?: string | string[] }>
}) {
  const { correo, siguiente } = await searchParams
  const uno = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)
  return <ActivarCuentaView correo={uno(correo)} siguiente={uno(siguiente)} />
}
