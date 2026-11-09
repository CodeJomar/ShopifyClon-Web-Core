"use client"

import * as React from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { iniciarPagoStripeAction } from "../actions/checkout.actions"

const clavePublica = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
// Se crea una sola vez; con la clave vacía no se carga Stripe.js y el bloque avisa de que falta configurarlo.
const stripePromise = clavePublica ? loadStripe(clavePublica) : null

/**
 * Pago con tarjeta de una orden con pasarela STRIPE. La web no calcula montos: pide a la API el intento de pago
 * (POST …/pagar) y Stripe.js lo confirma con el `client_secret`. Quien marca la orden como pagada es el webhook de la API;
 * aquí solo se espera a que `alPagar` la vea en `PAGADO`.
 */
export function PagoStripe({ subdominio, token, alPagar }: { subdominio: string; token: string; alPagar: () => Promise<boolean> }) {
  const [secreto, setSecreto] = React.useState<string | null>(null)
  const [iniciando, setIniciando] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (!stripePromise) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Pago con tarjeta no disponible</AlertTitle>
        <AlertDescription>Falta configurar la clave pública de Stripe (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).</AlertDescription>
      </Alert>
    )
  }

  const iniciar = async () => {
    setError(null)
    setIniciando(true)
    const res = await iniciarPagoStripeAction(subdominio, token)
    setIniciando(false)
    if (res.ok) setSecreto(res.datos.client_secret)
    else setError(res.error.message)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagar con tarjeta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!secreto ? (
          <Button type="button" className="w-full" disabled={iniciando} onClick={iniciar}>
            {iniciando ? "Preparando el pago…" : "Pagar con tarjeta"}
          </Button>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret: secreto, locale: "es" }}>
            <FormularioTarjeta alPagar={alPagar} />
          </Elements>
        )}
      </CardContent>
    </Card>
  )
}

function FormularioTarjeta({ alPagar }: { alPagar: () => Promise<boolean> }) {
  const stripe = useStripe()
  const elements = useElements()
  const [procesando, setProcesando] = React.useState(false)
  const [mensaje, setMensaje] = React.useState<string | null>(null)

  const pagar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcesando(true)
    setMensaje(null)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    })
    if (error) {
      setMensaje(error.message ?? "No se pudo procesar el pago.")
      setProcesando(false)
      return
    }
    setMensaje("Pago recibido. Confirmando con la tienda…")
    const confirmado = await alPagar()
    if (!confirmado) setMensaje("Recibimos tu pago; la confirmación puede tardar unos segundos. Vuelve a consultar tu orden.")
    setProcesando(false)
  }

  return (
    <form onSubmit={pagar} className="space-y-4">
      <PaymentElement />
      {mensaje && <p className="text-[13px] text-muted-foreground">{mensaje}</p>}
      <Button type="submit" className="w-full" disabled={!stripe || procesando}>
        {procesando ? "Procesando…" : "Pagar"}
      </Button>
    </form>
  )
}
