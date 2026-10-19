import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils/cn"
import { Spinner } from "@/shared/components/ui/spinner"

const buttonVariants = cva(
  // Base: Píldora (rounded-full), centrado, foco neutro y estado disabled con cursor de bloqueo visible
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent dark:disabled:bg-stone-800 dark:disabled:text-stone-500 dark:disabled:border-transparent dark:disabled:hover:bg-stone-800 dark:disabled:hover:text-stone-500 disabled:shadow-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Principal
        default: "bg-[#4C0107] text-white hover:bg-[#4C0107]/90 dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-sm hover:shadow-md focus-visible:ring-[#4C0107]/40",
        outline: "border-2 border-[#4C0107] text-[#4C0107] bg-transparent hover:bg-[#4C0107] hover:text-white dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800 dark:hover:text-white focus-visible:ring-[#4C0107]/40",
        ghost: "bg-[#EDE5E6] text-[#4C0107] hover:bg-[#d8cdd0] dark:text-stone-100 dark:hover:bg-stone-800 focus-visible:ring-[#4C0107]/40",

        // Neutral (Cancelar / Volver en diálogos: baja jerarquía, buen contraste con la acción principal)
        neutral: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 focus-visible:ring-slate-400/50",
        "neutral-outline": "border-2 border-slate-300 text-slate-700 bg-transparent hover:bg-slate-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800 focus-visible:ring-slate-400/50",

        // Danger (Errores, Cancelaciones)
        "danger-strong": "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500/40",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm focus-visible:ring-red-500/40",
        "danger-outline": "border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white focus-visible:ring-red-500/40",
        "danger-ghost": "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-500/40",

        // Success (Cobros, Confirmaciones)
        success: "bg-green-500 text-white hover:bg-green-600 shadow-sm focus-visible:ring-green-500/40",
        "success-outline": "border-2 border-green-500 text-green-500 bg-transparent hover:bg-green-500 hover:text-white focus-visible:ring-green-500/40",
        "success-ghost": "bg-green-50 text-green-700 hover:bg-green-100 focus-visible:ring-green-500/40",

        // Warning (Alertas, Modificaciones pendientes, Precaución)
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm focus-visible:ring-amber-500/40",
        "warning-outline": "border-2 border-amber-500 text-amber-600 bg-transparent hover:bg-amber-500 hover:text-white focus-visible:ring-amber-500/40",
        "warning-ghost": "bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-500/40",

        // Info (Notificaciones, Impresiones)
        info: "bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm focus-visible:ring-cyan-500/40",
        "info-outline": "border-2 border-cyan-500 text-cyan-500 bg-transparent hover:bg-cyan-500 hover:text-white focus-visible:ring-cyan-500/40",
        "info-ghost": "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 focus-visible:ring-cyan-500/40",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-xs",
        md: "h-12 px-6 text-md",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
        // Sin estilo propio: los dimensiona quien los usa (dialog, sheet, sidebar, carousel...).
        "icon-xs": "",
        "icon-sm": "",
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
  asChild?: boolean
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
      asChild = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || loading

    return (
      <Comp
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
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }