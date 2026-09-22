import { LoginView } from "@/modules/auth/views/login-view"

export const metadata = {
  title: "Iniciar sesión | Coffy Flow",
  description: "Ingresar credenciales para el accesso al sistema.",
}

export default function LoginPage() {
  return <LoginView />
}