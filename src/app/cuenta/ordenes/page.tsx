import { OrdenesView } from "@/modules/cuenta"

export const metadata = {
  title: "Mis compras | OTemu",
  description: "Compras que hiciste en OTemu.",
}

export default function OrdenesPage() {
  return (
    <div className="max-w-4xl">
      <OrdenesView />
    </div>
  )
}
