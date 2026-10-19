import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm, type DefaultValues, type FieldValues, type Resolver } from 'react-hook-form';

export type UseFilterFormOptions<TFieldValues extends FieldValues> = {
  /** Esquema Zod del filtro. */
  schema: Parameters<typeof zodResolver>[0];
  defaultValues: DefaultValues<TFieldValues>;
  autoFetch?: boolean;
  clearMode?: 'reset-only' | 'reset-and-filter';
  onFilter: (values: TFieldValues) => void;
};

export function useFilterForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  autoFetch = false,
  clearMode = 'reset-and-filter',
  onFilter,
}: UseFilterFormOptions<TFieldValues>) {
  const autoFetchRef = useRef(autoFetch);

  const form = useForm<TFieldValues>({
    resolver: zodResolver(schema) as unknown as Resolver<TFieldValues>,
    defaultValues,
  });

  useEffect(() => {
    const shouldRun = autoFetchRef.current;
    if (!shouldRun) return;
    autoFetchRef.current = false;
    onFilter(form.getValues());
  }, [form, onFilter]);

  const handleFilter = form.handleSubmit((values) => onFilter(values));

  const handleClear = () => {
    form.reset(defaultValues);
    if (clearMode === 'reset-and-filter') onFilter(defaultValues as TFieldValues);
  };

  return { form, handleFilter, handleClear };
}