import { LoginView } from "@/modules/auth"

export const metadata = {
  title: "Iniciar sesión | OTemu",
  description: "Entra a tu cuenta de OTemu.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string | string[]; siguiente?: string | string[] }>
}) {
  const { correo, siguiente } = await searchParams
  return <LoginView correo={Array.isArray(correo) ? correo[0] : correo} siguiente={Array.isArray(siguiente) ? siguiente[0] : siguiente} />
}
