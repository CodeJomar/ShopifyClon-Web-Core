import { redirect } from "next/navigation"

// Las tiendas de la persona se ven en el panel general del propietario.
export default function MisTiendasPage() {
  redirect("/propietario")
}
