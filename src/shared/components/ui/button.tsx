import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils/cn"
import { Spinner } from "@/shared/components/ui/spinner"

// docs/diseno-web.md §4.1. Solo tokens: nada de colores sueltos.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[calc(var(--radius))] text-[13.5px] font-bold transition-all cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:shadow-none disabled:hover:brightness-100 disabled:hover:translate-y-0 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [text-shadow:0_1px_2px_rgb(0_0_0/.14)] hover:brightness-105 hover:-translate-y-px",
        // Una sola acción de conversión por pantalla (Publicar producto, Comprar)
        shadow:
          "bg-primary text-primary-foreground [text-shadow:0_1px_2px_rgb(0_0_0/.14)] shadow-[0_8px_22px_-3px_rgb(var(--brand-rgb)/.55)] hover:brightness-105 hover:-translate-y-px",
        outline:
          "border-[1.8px] border-brand-strong bg-transparent text-brand-text hover:bg-brand-strong/10",
        soft:
          "border-[1.8px] border-brand-strong/30 bg-brand-strong/14 text-brand-text hover:bg-brand-strong/20",
        ghost:
          "bg-transparent text-brand-text hover:bg-brand-strong/12",
        link:
          "h-auto px-0 text-brand-text underline-offset-4 hover:underline",
        // Cancelar / Volver en diálogos
        neutral:
          "border-[1.8px] border-border bg-card text-foreground hover:bg-muted",
        // Confirmar algo destructivo
        danger:
          "bg-destructive text-white hover:brightness-105",
        "danger-outline":
          "border-[1.8px] border-destructive bg-transparent text-destructive hover:bg-destructive/9",
      },
      size: {
        sm: "h-8 px-3.5 text-xs",
        default: "h-10 px-[18px]",
        lg: "h-11 px-[22px] text-sm",
        icon: "size-10",
        "icon-sm": "size-8",
        // Sin estilo propio: los dimensiona quien los usa (dialog, sheet, sidebar, carousel...).
        "icon-xs": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Si está en loading muestra el Spinner; si no, renderiza el leftIcon si existe */}
        {loading ? (
          <Spinner className="shrink-0 text-current" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {children}
        {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
