import type { CSSProperties } from "react"
import { Check, ShieldCheck } from "lucide-react"
import { formatearDinero } from "@/shared/utils/dinero"
import { AvatarTienda } from "@/modules/mercado/components/tarjeta-tienda"
import { cn } from "@/shared/utils/cn"

const PARTES = [
  { nombre: "Café Andino", tono: 28, productos: 2, monto: 65.4 },
  { nombre: "Casa Quinua", tono: 168, productos: 1, monto: 119 },
  { nombre: "Taller Textil Cusco", tono: 262, productos: 1, monto: 189 },
]

/**
 * Pieza principal de la portada: un pedido con productos de tres tiendas, un solo pago y la barra que muestra cómo se reparte
 * automáticamente entre ellas. Es ilustrativa (cifras fijas): resume lo que distingue a OTemu de una tienda suelta.
 */
export function ReciboDividido({ className }: { className?: string }) {
  const total = PARTES.reduce((s, p) => s + p.monto, 0)

  return (
    <figure
      className={cn("relative rounded-[28px] bg-primary/60 p-px shadow-isla", className)}
      aria-label="Ejemplo de un pedido con productos de tres tiendas y un solo pago"
    >
      <div className="rounded-[27px] bg-card p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-muted-foreground">Tu pedido</p>
            <p className="mt-0.5 text-[36px] font-extrabold leading-none tracking-tight text-foreground sm:text-[42px]">{formatearDinero(total, "PEN")}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-[12px] font-extrabold text-brand-text">
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            Un solo pago
          </span>
        </div>

        <div
          className="mt-6 flex h-3 w-full gap-1 overflow-hidden rounded-full"
          role="img"
          aria-label={`Reparto: ${PARTES.map((p) => `${p.nombre} ${formatearDinero(p.monto, "PEN")}`).join(", ")}`}
        >
          {PARTES.map((p) => (
            <span
              key={p.nombre}
              style={{ "--t": p.tono, flexGrow: p.monto } as CSSProperties}
              className="barra-reparto h-full min-w-2 rounded-full bg-[hsl(var(--t)_80%_52%)] dark:bg-[hsl(var(--t)_72%_58%)]"
            />
          ))}
        </div>

        <ul className="mt-5 divide-y divide-border/60">
          {PARTES.map((p) => (
            <li key={p.nombre} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <AvatarTienda tienda={p} className="size-10 rounded-xl text-[16px]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-foreground">{p.nombre}</p>
                <p className="text-[12.5px] text-muted-foreground">
                  {p.productos} {p.productos === 1 ? "producto" : "productos"}, despacha por separado
                </p>
              </div>
              <p className="text-[15px] font-extrabold tracking-tight text-foreground">{formatearDinero(p.monto, "PEN")}</p>
            </li>
          ))}
        </ul>

        <p className="mt-5 flex items-center gap-2 rounded-xl bg-secondary px-3.5 py-2.5 text-[12.5px] font-medium text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-brand-text" />
          Cada tienda recibe automáticamente la parte que le corresponde.
        </p>
      </div>
    </figure>
  )
}
