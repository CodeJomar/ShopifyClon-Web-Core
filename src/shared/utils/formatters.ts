export const formatToCurrency = (
  value: number | string | null | undefined = 0,
  decimalPlaces: number = 2,
): string => {
  let num = Number(value ?? 0);
  if (Number.isNaN(num)) num = 0;

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(num);
};

export const formatDateStrict = (date: Date | string | number): string => {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
};