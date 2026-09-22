"use client"

import * as React from "react"
import { cn } from "@/shared/utils/cn"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "")

  const handleDigitChange = (index: number, char: string) => {
    const clean = char.replace(/\D/g, "")
    if (!clean) {
      const next = value.split("")
      next[index] = ""
      onChange(next.join(""))
      return
    }

    const next = value.split("")
    next[index] = clean[clean.length - 1] // Tomar el último dígito escrito
    const result = next.join("").slice(0, 6)
    onChange(result)

    // Saltar al siguiente casillero si no es el último
    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
    const focusTarget = Math.min(pasted.length, 5)
    inputRefs.current[focusTarget]?.focus()
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5 w-full">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleDigitChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "size-12 sm:size-13 rounded-2xl bg-slate-50 dark:bg-stone-900 border border-slate-200 dark:border-stone-800",
            "text-center text-xl font-bold text-slate-900 dark:text-stone-100 outline-none transition-all",
            "focus:border-[#4C0107] focus:ring-2 focus:ring-[#4C0107]/20 focus:bg-white dark:focus:bg-stone-850",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        />
      ))}
    </div>
  )
}