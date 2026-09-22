import type { SelectOption } from '@/shared/utils/arrays';

export const ESTADO_OPTIONS: SelectOption[] = [
  { value: '0', label: '(Todos)' },
  { value: '1', label: 'Activo' },
  { value: '2', label: 'Inactivo' },
];

export const ESTADO_FORM_OPTIONS: SelectOption[] = [
  { value: '', label: 'Seleccione' },
  { value: '1', label: 'Activo' },
  { value: '2', label: 'Inactivo' },
];