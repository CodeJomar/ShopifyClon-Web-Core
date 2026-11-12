import { LoginView } from "@/modules/auth"

export const metadata = {
  title: "Iniciar sesión | OTemu",
  description: "Entra a tu cuenta de OTemu.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ correo?: string | string[]; siguiente?: string | string[]; aviso?: string | string[] }>
}) {
  const { correo, siguiente, aviso } = await searchParams
  const uno = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v)
  return <LoginView correo={uno(correo)} siguiente={uno(siguiente)} aviso={uno(aviso)} />
}
