import * as React from "react"

interface IlustracionTiendaProps {
  /** Código HTTP que se muestra en el letrero de la tienda. */
  codigo: number
  className?: string
}

/**
 * Ilustración neutra de tienda para las pantallas de error (reemplaza las tazas de la plantilla, W-002).
 * Solo clases de token (fill-*, stroke-*, text-*): se repinta solo con el tema claro u oscuro.
 */
export function IlustracionTienda({ codigo, className }: IlustracionTiendaProps) {
  return (
    <svg viewBox="0 0 240 200" role="img" aria-label={`Ilustración de tienda, error ${codigo}`} className={className}>
      {/* Sombra en el suelo */}
      <ellipse cx="120" cy="184" rx="92" ry="8" className="fill-muted-foreground/15" />
      {/* Cuerpo de la tienda */}
      <rect x="44" y="82" width="152" height="96" rx="10" strokeWidth="2" className="fill-card stroke-border" />
      {/* Letrero con el código */}
      <rect x="62" y="98" width="116" height="26" rx="8" className="fill-brand-strong/20" />
      <text x="120" y="116" textAnchor="middle" fontSize="13" fontWeight="800" className="fill-brand-text">
        {codigo}
      </text>
      {/* Toldo con festones */}
      <path d="M30 82 L210 82 L202 62 L38 62 Z" className="fill-brand-strong" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${38 + i * 28} 62 Q${52 + i * 28} 76 ${66 + i * 28} 62`} className="fill-primary" />
      ))}
      {/* Ventanas y puerta */}
      <rect x="62" y="134" width="26" height="22" rx="3" className="fill-muted-foreground/20" />
      <rect x="152" y="134" width="26" height="22" rx="3" className="fill-muted-foreground/20" />
      <rect x="100" y="132" width="40" height="46" rx="4" className="fill-muted-foreground/30" />
      <circle cx="132" cy="156" r="2.5" className="fill-foreground" />
    </svg>
  )
}

export const Cup403Illustration = (props: { className?: string }) => <IlustracionTienda codigo={403} {...props} />
export const Cup404Illustration = (props: { className?: string }) => <IlustracionTienda codigo={404} {...props} />
export const Cup429Illustration = (props: { className?: string }) => <IlustracionTienda codigo={429} {...props} />
export const Cup500Illustration = (props: { className?: string }) => <IlustracionTienda codigo={500} {...props} />
