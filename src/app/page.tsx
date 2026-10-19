import { redirect } from "next/navigation"

// La raíz no tiene contenido propio: lleva a Inicio. El Proxy manda al login si no hay sesión.
export default function Page() {
  redirect("/home")
}
