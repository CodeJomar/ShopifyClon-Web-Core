import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/utils/cn"
import { Spinner } from "@/shared/components/ui/spinner"

const buttonVariants = cva(
  // Base: Píldora (rounded-full), centrado, foco neutro y estado disabled con cursor de bloqueo visible
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent disabled:shadow-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Principal
        default: "bg-[#4C0107] text-white hover:bg-[#4C0107]/90 dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-sm hover:shadow-md",
        outline: "border-2 border-[#4C0107] text-[#4C0107] bg-transparent hover:bg-[#4C0107] hover:text-white dark:border-stone-700 dark:text-stone-100 dark:hover:bg-stone-800 dark:hover:text-white",
        ghost: "bg-[#EDE5E6] text-[#4C0107] hover:bg-[#d8cdd0] dark:text-stone-100 dark:hover:bg-stone-800",

        // Danger (Errores, Cancelaciones)
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
        "danger-outline": "border-2 border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white",
        "danger-ghost": "bg-red-50 text-red-600 hover:bg-red-100",

        // Success (Cobros, Confirmaciones)
        success: "bg-green-500 text-white hover:bg-green-600 shadow-sm",
        "success-outline": "border-2 border-green-500 text-green-500 bg-transparent hover:bg-green-500 hover:text-white",
        "success-ghost": "bg-green-50 text-green-700 hover:bg-green-100",

        // Warning (Alertas, Modificaciones pendientes, Precaución)
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
        "warning-outline": "border-2 border-amber-500 text-amber-600 bg-transparent hover:bg-amber-500 hover:text-white",
        "warning-ghost": "bg-amber-50 text-amber-700 hover:bg-amber-100",

        // Info (Notificaciones, Impresiones)
        info: "bg-cyan-500 text-white hover:bg-cyan-600 shadow-sm",
        "info-outline": "border-2 border-cyan-500 text-cyan-500 bg-transparent hover:bg-cyan-500 hover:text-white",
        "info-ghost": "bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 px-4 text-xs",
        md: "h-12 px-6 text-md",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
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