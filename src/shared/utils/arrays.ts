export interface SelectOption {
  value: string;
  label: string;
}

export function optionMapper<T, K1 extends keyof T, K2 extends keyof T>(
  arr: readonly T[] | T[],
  valueKey: K1,
  labelKey: K2,
): SelectOption[] {
  return (arr ?? []).map((item) => ({
    value: String(item[valueKey] ?? ""),
    label: String(item[labelKey] ?? ""),
  }));
}