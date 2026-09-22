import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';

export type UseFilterFormOptions<TFieldValues extends FieldValues> = {
  schema: unknown;
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
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
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