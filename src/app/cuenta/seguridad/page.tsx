import { redirect } from "next/navigation"

// La seguridad se unificó con el perfil en «Mi cuenta» (dos columnas).
export default function SeguridadPage() {
  redirect("/cuenta")
}
