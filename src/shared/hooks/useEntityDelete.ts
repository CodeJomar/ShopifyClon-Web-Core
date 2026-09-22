import { useCallback, useState } from 'react';
import type { CheckStatus } from '@/dtos/core/checkStatus.dto';

type UseEntityDeleteProps<TId = string> = {
  actionDelete: (id: TId) => Promise<CheckStatus>;
  onSuccess?: (deletedId: TId) => void;
  onError?: (message: string) => void;
};

export function useEntityDelete<TId = string>({ actionDelete, onSuccess, onError }: UseEntityDeleteProps<TId>) {
  const [entityToDelete, setEntityToDelete] = useState<TId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = useCallback(
    async (id: TId) => {
      setEntityToDelete(id);
      setIsDeleting(true);
      try {
        const response = await actionDelete(id);
        if (response.isOk()) onSuccess?.(id);
        else onError?.(response.getMessage());
        return response;
      } catch {
        const message = 'Error inesperado al eliminar el registro';
        onError?.(message);
        return null;
      } finally {
        setIsDeleting(false);
        setEntityToDelete(null);
      }
    },
    [actionDelete, onError, onSuccess],
  );

  return { entityToDelete, isDeleting, confirmDelete };
}