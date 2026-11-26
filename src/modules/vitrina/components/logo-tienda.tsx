import { cn } from "@/shared/utils/cn"

/** Logo de la tienda: la imagen que subió el propietario o, sin ella, la inicial del nombre sobre el color de la paleta. */
export function LogoTienda({ nombre, logoUrl, className }: { nombre: string; logoUrl?: string | null; className?: string }) {
  if (logoUrl) {
    // <img> y no next/image: el logo puede venir de la API o de cualquier dirección https que pegue el propietario.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={`Logo de ${nombre}`} width={112} height={112} loading="lazy" className={cn("shrink-0 bg-card object-contain", className)} />
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-primary font-extrabold text-primary-foreground", className)} aria-hidden="true">
      {nombre.trim()[0]?.toUpperCase() ?? "T"}
    </span>
  )
}
