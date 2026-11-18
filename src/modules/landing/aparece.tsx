"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

/** Hace que un bloque aparezca al entrar en pantalla (sube y se aclara). Con «reducir movimiento» se muestra sin animación. */
export function Aparece({ children, retraso = 0, className }: { children: React.ReactNode; retraso?: number; className?: string }) {
  const reducido = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reducido ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: retraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
