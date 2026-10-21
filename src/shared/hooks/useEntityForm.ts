import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Resultado } from '@/lib/api/resultado';

type UseEntityFormProps<
  TDetail,
  TFormValues,
  TCreatePayload,
  TUpdatePayload,
  TCreateResponse,
> = {
  id?: string;
  actionGet?: (id: string) => Promise<Resultado<TDetail>>;
  actionCreate?: (payload: TCreatePayload) => Promise<Resultado<TCreateResponse>>;
  actionUpdate?: (id: string, payload: TUpdatePayload) => Promise<Resultado<unknown>>;
  mapEntityToForm: (entity: TDetail) => TFormValues;
  mapFormToCreatePayload: (values: TFormValues) => TCreatePayload;
  mapFormToUpdatePayload: (values: TFormValues, id: string) => TUpdatePayload;
  mapCreateToForm?: (values: TFormValues, response: TCreateResponse) => TFormValues;
  onCreated?: (response: TCreateResponse, values: TFormValues) => void;
  onUpdated?: (values: TFormValues) => void;
  onLoadError?: (message: string) => void;
  onSaveError?: (message: string) => void;
};

export function useEntityForm<
  TDetail,
  TFormValues,
  TCreatePayload,
  TUpdatePayload,
  TCreateResponse,
>({
  id,
  actionGet,
  actionCreate,
  actionUpdate,
  mapEntityToForm,
  mapFormToCreatePayload,
  mapFormToUpdatePayload,
  mapCreateToForm,
  onCreated,
  onUpdated,
  onLoadError,
  onSaveError,
}: UseEntityFormProps<TDetail, TFormValues, TCreatePayload, TUpdatePayload, TCreateResponse>) {
  const isEditing = Boolean(id);
  // Al editar, arranca "cargando": así el efecto de carga inicial no necesita un setState sincrónico.
  const [isLoading, setIsLoading] = useState(isEditing);
  const [hasLoadingError, setHasLoadingError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entity, setEntity] = useState<TDetail | null>(null);

  // Con promesas encadenadas: los setState ocurren al resolver, nunca de forma sincrónica dentro del efecto.
  const fetchEntity = useCallback((): Promise<void> => {
    if (!id || !actionGet) return Promise.resolve();
    return actionGet(id)
      .then((res) => {
        if (!res.ok) {
          setHasLoadingError(true);
          onLoadError?.(res.mensaje);
          return;
        }
        setEntity(res.datos);
      })
      .catch(() => {
        setHasLoadingError(true);
        onLoadError?.('Error inesperado al cargar el registro');
      })
      .finally(() => setIsLoading(false));
  }, [actionGet, id, onLoadError]);

  // Reintento manual (botón "reintentar"): aquí sí se limpia el error y se vuelve a mostrar la carga.
  const reload = useCallback(async () => {
    setIsLoading(true);
    setHasLoadingError(false);
    await fetchEntity();
  }, [fetchEntity]);

  useEffect(() => {
    if (isEditing) void fetchEntity();
  }, [isEditing, fetchEntity]);

  const submit = useCallback(
    async (values: TFormValues): Promise<TFormValues | null> => {
      setIsSubmitting(true);
      try {
        if (isEditing && id && actionUpdate) {
          const payload = mapFormToUpdatePayload(values, id);
          const res = await actionUpdate(id, payload);
          if (!res.ok) {
            onSaveError?.(res.mensaje);
            return null;
          }
          onUpdated?.(values);
          return values;
        }

        if (actionCreate) {
          const payload = mapFormToCreatePayload(values);
          const res = await actionCreate(payload);
          if (!res.ok) {
            onSaveError?.(res.mensaje);
            return null;
          }
          onCreated?.(res.datos, values);
          if (mapCreateToForm) return mapCreateToForm(values, res.datos);
          return values;
        }
        return null;
      } catch {
        onSaveError?.('Error inesperado al guardar el registro');
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      actionCreate,
      actionUpdate,
      id,
      isEditing,
      mapCreateToForm,
      mapFormToCreatePayload,
      mapFormToUpdatePayload,
      onCreated,
      onSaveError,
      onUpdated,
    ]
  );

  const formValues = useMemo(() => {
    if (!entity) return null;
    return mapEntityToForm(entity);
  }, [entity, mapEntityToForm]);

  return { isEditing, entity, formValues, isLoading, hasLoadingError, isSubmitting, reload, submit };
}