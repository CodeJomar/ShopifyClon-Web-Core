import * as React from "react"

/** Pie estándar de los modales del POS: dos botones centrados y del mismo tamaño; uno solo, a la derecha. */
export function PieModal({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 dark:border-stone-800 [&>*]:w-full sm:flex-row sm:justify-end sm:has-[>:nth-child(2)]:justify-center sm:[&>*]:w-48">
      {children}
    </div>
  )
}
