import { useCallback, useState } from 'react';
import type { DataQuery } from '@/dtos/core/dataQuery.dto';

type UseEntityListState<T> = {
  entities: T[];
  total: number;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  notFoundMessage: string | null;
};

export function useEntityList<T, F = void>(
  actionFetch: (filters?: F) => Promise<DataQuery<T>>,
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
        if (!response.isOk()) {
          const message = response.getMessage();
          if (response.isNoData()) {
            setState((prev) => ({ ...prev, entities: [], total: 0, hasError: false, notFoundMessage: message }));
          } else {
            setState((prev) => ({ ...prev, entities: [], total: 0, hasError: true, errorMessage: message }));
            options?.onError?.(message);
          }
        } else {
          setState((prev) => ({ ...prev, entities: response.data ?? [], total: response.total ?? 0 }));
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