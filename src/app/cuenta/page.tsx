import { CuentaView } from "@/modules/cuenta"

export const metadata = {
  title: "Mi cuenta | OTemu",
  description: "Tu perfil, tu seguridad y tus compras en OTemu.",
}

export default function CuentaPage() {
  return (
    <main className="min-h-screen bg-background p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <CuentaView />
      </div>
    </main>
  )
}
