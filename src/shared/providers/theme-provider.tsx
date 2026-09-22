"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { usePathname } from "next/navigation"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname()

  // Forzamos el tema a "light" si estamos en la página de login o registro
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/forgot-password")

  return (
    <NextThemesProvider
      {...props}
      forcedTheme={isAuthPage ? "light" : undefined}
    >
      {children}
    </NextThemesProvider>
  )
}