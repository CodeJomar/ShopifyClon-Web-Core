import { LoginView } from "@/modules/auth"

export const metadata = {
  title: "Iniciar sesión | Coffy Flow",
  description: "Ingresar credenciales para el accesso al sistema.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string | string[]; motivo?: string | string[] }>
}) {
  const { siguiente, motivo } = await searchParams
  return (
    <LoginView
      siguiente={Array.isArray(siguiente) ? siguiente[0] : siguiente}
      motivo={((m) => (m === "inactividad" || m === "reemplazada" ? m : undefined))(Array.isArray(motivo) ? motivo[0] : motivo)}
    />
  )
}
