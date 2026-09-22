import { z } from 'zod';
import { isSafeString } from './security';

type CommonStringParams = {
  required?: boolean;
  min?: number;
  max?: number;
  messages?: { required?: string; max?: string; isSafe?: string; min?: string };
};

export function zodSafeString({ required = true, min = 1, max = 255, messages }: CommonStringParams = {}) {
  // El orden correcto en Zod: transformaciones nativas PRIMERO, refine al final.
  const base = z
    .string({ required_error: messages?.required ?? 'Este campo es requerido' })
    .trim()
    .max(max, messages?.max ?? `Máximo ${max} caracteres`)
    .refine(isSafeString, { message: messages?.isSafe ?? 'Contiene caracteres no permitidos' });

  if (required) {
    return base.min(min, messages?.min ?? messages?.required ?? 'Este campo no puede estar vacío');
  }

  return base.optional().or(z.literal(''));
}