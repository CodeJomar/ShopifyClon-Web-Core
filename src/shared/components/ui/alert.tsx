import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/utils/cn"

const alertVariants = cva(
  // Isla con barra lateral de 6 px e ícono en círculo de 36 px (docs/diseno-web.md §4.4)
  "group/alert relative grid w-full gap-0.5 rounded-xl border border-island-border border-l-[6px] bg-card px-4 py-3.5 text-left text-card-foreground shadow-isla has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:items-center has-[>svg]:gap-x-3.5 *:[svg]:row-span-2 *:[svg]:size-9 *:[svg]:rounded-full *:[svg]:p-2.5",
  {
    variants: {
      variant: {
        default: "border-l-info *:[svg]:bg-info/16 *:[svg]:text-info-text",
        success: "border-l-primary *:[svg]:bg-primary/16 *:[svg]:text-brand-text",
        warning: "border-l-warning *:[svg]:bg-warning/16 *:[svg]:text-warning-text",
        destructive: "border-l-destructive *:[svg]:bg-destructive/16 *:[svg]:text-destructive-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-[13.5px] font-extrabold leading-snug group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-[12.5px] text-balance text-muted-foreground group-has-[>svg]/alert:col-start-2 md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
