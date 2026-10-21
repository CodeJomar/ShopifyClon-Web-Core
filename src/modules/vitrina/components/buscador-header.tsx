"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/shared/components/ui/input"

interface BuscadorHeaderProps {
  subdominio: string
}

export function BuscadorHeader({ subdominio }: BuscadorHeaderProps) {
  const router = useRouter()
  const [texto, setTexto] = React.useState("")

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!texto.trim()) {
      router.push(`/tienda/${encodeURIComponent(subdominio)}/productos`)
      return
    }
    router.push(`/tienda/${encodeURIComponent(subdominio)}/productos?texto=${encodeURIComponent(texto.trim())}`)
  }

  return (
    <form onSubmit={manejarSubmit} className="relative w-full max-w-xs">
      <Input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar en la tienda..."
        className="h-9 pr-8 text-xs"
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Buscar"
      >
        <Search className="size-3.5" aria-hidden="true" />
      </button>
    </form>
  )
}
