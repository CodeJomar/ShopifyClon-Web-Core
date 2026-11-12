import { DesbloquearCuentaView } from "@/modules/auth"

export const metadata = {
  title: "Desbloquear cuenta | OTemu",
  description: "Escribe el código de 6 dígitos para desbloquear tu cuenta.",
}

export default async function DesbloquearPage({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string | string[] }>
}) {
  const { correo } = await searchParams
  return <DesbloquearCuentaView correo={Array.isArray(correo) ? correo[0] : correo} />
}
