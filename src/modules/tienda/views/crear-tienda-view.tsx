"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link as LinkIcon, Mail, Store } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { FloatingInput } from "@/shared/components/composed/floating-input"
import { FloatingSelect } from "@/shared/components/composed/floating-select"
import { SelectContent, SelectItem } from "@/shared/components/ui/select"
import { toast } from "@/shared/components/ui/toast"
import { TarjetaPlan } from "../components/tarjeta-plan"
import { crearTiendaAction, fijarTiendaAction, planesAction } from "../actions/tienda.actions"
import { perfilAction } from "@/modules/auth"
import { crearTiendaSchema, type CrearTiendaValues } from "../schema"
import type { PlanDto } from "@/dtos/tienda"
import type { ErrorApi } from "@/lib/api/error-api"

export function CrearTiendaView({ correoPerfil }: { correoPerfil?: string }) {
  const router = useRouter()
  const [planes, setPlanes] = React.useState<PlanDto[] | null>(null)
  const [errorPlanes, setErrorPlanes] = React.useState<ErrorApi | null>(null)
  const [codigoPlan, setCodigoPlan] = React.useState<string>("")
  const [paso, setPaso] = React.useState<1 | 2>(1)
  const [error, setError] = React.useState<ErrorApi | null>(null)
  const [correoCuenta, setCorreoCuenta] = React.useState<string>("")
  const refs = React.useRef<Record<string, HTMLDivElement | null>>({})

  React.useEffect(() => {
    let cancelado = false
    planesAction().then((res) => {
      if (cancelado) return
      if (!res.ok) return setErrorPlanes(res.error)
      setPlanes(res.datos)
      // Preselección: BASICO si existe; si no, el primero.
      setCodigoPlan((actual) => actual || res.datos.find((p) => p.codigo === "BASICO")?.codigo || res.datos[0]?.codigo || "")
    })
    return () => {
      cancelado = true
    }
  }, [])

  // El correo de contacto se prellena con el correo de la cuenta (si la persona no lo cambió antes).
  React.useEffect(() => {
    let cancelado = false
    perfilAction().then((res) => {
      if (cancelado || !res.ok) return
      setCorreoCuenta(res.datos.correo_electronico)
    })
    return () => {
      cancelado = true
    }
  }, [])

  const form = useForm<CrearTiendaValues>({
    resolver: zodResolver(crearTiendaSchema),
    defaultValues: { nombre: "", subdominio: "", correo_contacto: correoPerfil ?? "", moneda: "PEN", codigo_plan: "" },
  })
  const subdominio = useWatch({ control: form.control, name: "subdominio" })
  React.useEffect(() => {
    if (correoCuenta && !form.getValues("correo_contacto")) form.setValue("correo_contacto", correoCuenta)
  }, [correoCuenta, form])
  const moneda = useWatch({ control: form.control, name: "moneda" })

  const elegirPlan = (codigo: string) => {
    setCodigoPlan(codigo)
    refs.current[codigo]?.focus()
  }

  // Teclado: flechas mueven la selección entre planes; Espacio o Intro la confirman.
  const teclaPlan = (evento: React.KeyboardEvent<HTMLDivElement>) => {
    if (!planes) return
    const indice = planes.findIndex((p) => p.codigo === codigoPlan)
    const mover = (delta: number) => elegirPlan(planes[(indice + delta + planes.length) % planes.length].codigo)
    if (evento.key === "ArrowRight" || evento.key === "ArrowDown") {
      evento.preventDefault()
      mover(1)
    } else if (evento.key === "ArrowLeft" || evento.key === "ArrowUp") {
      evento.preventDefault()
      mover(-1)
    } else if (evento.key === " " || evento.key === "Enter") {
      evento.preventDefault()
      elegirPlan(codigoPlan)
    }
  }

  const continuar = () => {
    if (!codigoPlan) return
    form.setValue("codigo_plan", codigoPlan)
    setPaso(2)
  }

  const crear = form.handleSubmit(async (valores) => {
    setError(null)
    const res = await crearTiendaAction(valores)
    if (!res.ok) {
      const e = res.error
      if (e.codigo === "TIE-001") form.setError("subdominio", { message: e.message })
      else setError(e)
      return
    }
    const activa = await fijarTiendaAction(res.datos.id)
    if (!activa.ok) return setError(activa.error)
    const plan = planes?.find((p) => p.codigo === valores.codigo_plan)
    toast.add({
      type: "success",
      title: "Tu tienda está lista",
      description: plan ? `Tienes ${plan.dias_prueba} días de prueba.` : undefined,
    })
    router.replace("/panel")
  })

  const registroSubdominio = form.register("subdominio")

  if (errorPlanes) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No pudimos cargar los planes</AlertTitle>
        <AlertDescription>{errorPlanes.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paso {paso} de 2</p>
        <h1 className="text-[18px] font-extrabold tracking-tight text-foreground">
          {paso === 1 ? "Elige tu plan" : "Datos de tu tienda"}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {paso === 1 ? "Empiezas con prueba gratis; puedes cambiar de plan después." : "Así te encontrarán tus clientes."}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No pudimos crear tu tienda</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {paso === 1 && (
        <>
          {!planes ? (
            <p className="text-[13px] text-muted-foreground" aria-live="polite">
              Cargando planes…
            </p>
          ) : (
            <div role="radiogroup" aria-label="Planes" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {planes.map((plan) => (
                <TarjetaPlan
                  key={plan.codigo}
                  ref={(el) => {
                    refs.current[plan.codigo] = el
                  }}
                  plan={plan}
                  seleccionada={plan.codigo === codigoPlan}
                  enfoque={plan.codigo === codigoPlan}
                  destacada={plan.codigo === "BASICO"}
                  onSeleccionar={() => elegirPlan(plan.codigo)}
                  onTecla={teclaPlan}
                />
              ))}
            </div>
          )}
          <Button type="button" size="lg" className="w-full" disabled={!codigoPlan} onClick={continuar}>
            Continuar
          </Button>
        </>
      )}

      {paso === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Tu tienda</CardTitle>
            <CardDescription>Puedes cambiar estos datos más adelante.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={crear} noValidate className="space-y-5">
              <FloatingInput
                label="Nombre de la tienda"
                leftIcon={<Store className="size-4" aria-hidden="true" />}
                state={form.formState.errors.nombre ? "error" : "default"}
                mensajeError={form.formState.errors.nombre?.message}
                {...form.register("nombre")}
              />
              <FloatingInput
                label="Subdominio"
                leftIcon={<LinkIcon className="size-4" aria-hidden="true" />}
                ayuda={`Tu tienda estará en otemu.com/tienda/${subdominio || "tu-tienda"}`}
                state={form.formState.errors.subdominio ? "error" : "default"}
                mensajeError={form.formState.errors.subdominio?.message}
                {...registroSubdominio}
                onChange={(evento) => {
                  evento.target.value = evento.target.value.toLowerCase()
                  registroSubdominio.onChange(evento)
                }}
              />
              <FloatingInput
                label="Correo de contacto"
                type="email"
                leftIcon={<Mail className="size-4" aria-hidden="true" />}
                state={form.formState.errors.correo_contacto ? "error" : "default"}
                mensajeError={form.formState.errors.correo_contacto?.message}
                {...form.register("correo_contacto")}
              />
              <FloatingSelect
                label="Moneda"
                value={moneda}
                onValueChange={(valor) => form.setValue("moneda", valor as "PEN" | "USD")}
              >
                <SelectContent>
                  <SelectItem value="PEN">Sol peruano (PEN)</SelectItem>
                  <SelectItem value="USD">Dólar estadounidense (USD)</SelectItem>
                </SelectContent>
              </FloatingSelect>

              <div className="flex gap-3">
                <Button type="button" variant="neutral" className="flex-1" onClick={() => setPaso(1)}>
                  Volver
                </Button>
                <Button type="submit" className="flex-1" loading={form.formState.isSubmitting}>
                  Crear tienda
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
