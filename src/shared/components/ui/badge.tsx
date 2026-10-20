import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils/cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Etiqueta de estado (docs/diseno-web.md §4.3): el color lo da `tono`.
        estado: "h-auto rounded-full px-3.5 py-1 text-xs font-bold",
      },
      tono: {
        neutro: "bg-tono-neutro-bg text-tono-neutro-fg",
        contorno: "border-[1.8px] border-current bg-transparent text-tono-contorno-fg",
        info: "bg-tono-info-bg text-tono-info-fg",
        exito: "bg-tono-exito-bg text-tono-exito-fg",
        marca: "bg-tono-marca-bg text-tono-marca-fg",
        aviso: "bg-tono-aviso-bg text-tono-aviso-fg",
        peligro: "bg-tono-peligro-bg text-tono-peligro-fg",
        naranja: "bg-tono-naranja-bg text-tono-naranja-fg",
        morado: "bg-tono-morado-bg text-tono-morado-fg",
        indigo: "bg-tono-indigo-bg text-tono-indigo-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type TonoInsignia = NonNullable<VariantProps<typeof badgeVariants>["tono"]>

function Badge({
  className,
  variant = "default",
  tono,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, tono }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
