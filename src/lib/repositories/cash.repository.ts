import { executeStoredProcedure } from '../db/procedures/executor';
import { DB_PROCEDURES } from '../db/procedures/registry';

export const closeCashShift = async (shiftId: number, declaredAmount: number) => {
  // Intellisense sugerirá los nombres válidos y el ejecutor sanitizará los parámetros
  await executeStoredProcedure(
    DB_PROCEDURES.CLOSE_CASH_SHIFT,
    [shiftId, declaredAmount]
  );
};