import { z } from 'zod';

function isValidHHMM(value: string) {
  return /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(value);
}

export const zodLocalTimeString = (required = true, message = 'Formato inválido (HH:mm)') => {
  const schema = z.string().superRefine((value, ctx) => {
    const v = (value ?? '').trim();
    if (!required && v === '') return;
    if (!v) {
      ctx.addIssue({ code: 'custom', message: 'La hora es requerida' });
      return;
    }
    if (!isValidHHMM(v)) {
      ctx.addIssue({ code: 'custom', message });
    }
  });
  return required ? schema : schema.optional();
};

/**
 * Validador para asegurar que la fecha de inicio no sea mayor a la fecha de fin.
 * Útil para filtros de reportes de ventas y turnos de caja.
 */
export const zodDateRangeRefine = <T extends z.ZodRawShape>({
  startDateKey,
  endDateKey,
  message = 'La fecha inicial no puede ser mayor a la fecha final',
}: {
  startDateKey: keyof T;
  endDateKey: keyof T;
  message?: string;
}) => {
  return (data: Record<string, any>, ctx: z.RefinementCtx) => {
    const start = data[startDateKey as string];
    const end = data[endDateKey as string];

    if (!start || !end) return;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: [endDateKey as string],
      });
    }
  };
};