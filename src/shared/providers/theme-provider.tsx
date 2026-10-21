"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Las rutas de auth respetan el tema claro u oscuro del usuario (W-004): no hay tema forzado.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
