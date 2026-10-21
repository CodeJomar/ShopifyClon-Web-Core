import { redirect } from "next/navigation"

// La cuenta es una sola pantalla: esta ruta antigua lleva a su sección.
export default function Page() {
  redirect("/cuenta#compras")
}
