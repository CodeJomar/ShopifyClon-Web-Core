import { ForgotPasswordView } from "@/modules/auth/views/forgot-password-view"

export const metadata = {
  title: "Recuperar Contraseña | Coffy Flow",
  description: "Flujo de recuperación y verificación de acceso",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />
}