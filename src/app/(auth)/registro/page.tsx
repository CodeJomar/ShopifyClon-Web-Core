import { RegistroView } from "@/modules/auth"

export const metadata = {
  title: "Crear cuenta | OTemu",
  description: "Crea tu cuenta de OTemu.",
}

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ siguiente?: string | string[] }> }) {
  const { siguiente } = await searchParams
  return <RegistroView siguiente={Array.isArray(siguiente) ? siguiente[0] : siguiente} />
}
