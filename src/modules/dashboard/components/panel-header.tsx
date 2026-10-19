"use client"

import * as React from "react"

/* -------------------------------------------------------------------------- */
/*                                 Auxiliares                                 */
/* -------------------------------------------------------------------------- */

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-stone-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
