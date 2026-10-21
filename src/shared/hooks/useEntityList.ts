import { useCallback, useState } from 'react';
import type { Resultado } from '@/lib/api/resultado';
import type { Paginado } from '@/dtos/core/respuesta-api.dto';

type UseEntityListState<T> = {
  entities: T[];
  total: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  notFoundMessage: string | null;
};

export function useEntityList<T, F = void>(
  actionFetch: (filters?: F) => Promise<Resultado<Paginado<T>>>,
  options?: { onError?: (message: string) => void }
) {
  const [state, setState] = useState<UseEntityListState<T>>({
    entities: [],
    total: 0,
    isLoading: false,
    hasError: false,
    errorMessage: null,
    notFoundMessage: null,
  });

  const fetchEntities = useCallback(
    async (filters?: F) => {
      setState((prev) => ({ ...prev, isLoading: true, hasError: false, errorMessage: null, notFoundMessage: null }));
      try {
        const response = await actionFetch(filters);
        if (!response.ok) {
          const message = response.mensaje;
          // La API responde 404 cuando la consulta no tiene registros (GEN-404 / sin datos): no es un error de pantalla.
          if (response.estado === 404) {
            setState((prev) => ({ ...prev, entities: [], total: 0, hasError: false, notFoundMessage: message }));
          } else {
            setState((prev) => ({ ...prev, entities: [], total: 0, hasError: true, errorMessage: message }));
            options?.onError?.(message);
          }
        } else {
          setState((prev) => ({ ...prev, entities: response.datos.datos, total: response.datos.total }));
        }
      } catch {
        const message = 'Error inesperado al consultar los datos';
        setState((prev) => ({ ...prev, entities: [], total: 0, hasError: true, errorMessage: message }));
        options?.onError?.(message);
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [actionFetch, options]
  );

  const resetEntities = useCallback(() => {
    setState({ entities: [], total: 0, isLoading: false, hasError: false, errorMessage: null, notFoundMessage: null });
  }, []);

  return { ...state, fetchEntities, resetEntities };
}