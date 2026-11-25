import { MisTiendasView } from "@/modules/tienda/views/mis-tiendas-view"

export const metadata = { title: "Mis tiendas | OTemu" }

// Las tiendas donde participa la persona (con su rol) y la elección de la tienda activa. El resumen de las que es propietaria está en /propietario.
export default function MisTiendasPage() {
  return <MisTiendasView />
}
