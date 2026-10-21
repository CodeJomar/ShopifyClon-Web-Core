import { CuentaView } from "@/modules/cuenta"

export const metadata = {
  title: "Mi cuenta | OTemu",
  description: "Tu perfil, tu seguridad y tus compras en OTemu.",
}

export default function CuentaPage() {
  return (
    <div className="max-w-4xl">
      <CuentaView />
    </div>
  )
}
