// Clases compartidas de la zona pública (landing, mercado, planes). Todo sale de los tokens de globals.css.

/** Botón principal de la zona pública: degradado de marca con tinta oscura (el blanco sobre #00E699 no llega a 4.5:1). */
export const claseBotonMarca =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-grad-marca px-5 text-[14px] font-extrabold text-sobre-marca " +
  "shadow-[0_10px_26px_-10px_rgb(var(--brand-rgb)/0.7)] outline-none transition-all duration-200 " +
  "hover:-translate-y-px hover:brightness-105 focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-4"

/** Botón secundario: borde de marca, fondo transparente. */
export const claseBotonContorno =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border-[1.8px] border-brand-strong/60 bg-transparent px-5 text-[14px] font-bold text-foreground " +
  "outline-none transition-all duration-200 hover:border-brand-strong hover:bg-primary/10 focus-visible:ring-[3px] focus-visible:ring-ring/40 [&_svg]:size-4"

/** Contenedor de página con el ancho y los márgenes de la zona pública. */
export const claseContenedor = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
