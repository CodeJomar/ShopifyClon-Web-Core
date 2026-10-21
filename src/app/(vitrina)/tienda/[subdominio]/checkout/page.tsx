import { CheckoutView } from "@/modules/checkout"

export default async function CheckoutPage({ params }: { params: Promise<{ subdominio: string }> }) {
  const { subdominio } = await params
  return <CheckoutView subdominio={subdominio} />
}
