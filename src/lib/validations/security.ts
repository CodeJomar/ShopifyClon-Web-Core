/**
 * Verifica si una cadena contiene patrones peligrosos (XSS o SQL Injection).
 */
export const isSafeString = (value: string): boolean => {
  if (!value) return true;
  const xssPattern =
    /(<\s*script|<\s*img|<\s*svg|<\s*iframe|<\s*object|<\s*embed|<\s*link|<\s*meta|on\w+\s*=|javascript:|data:text\/html|document\.|window\.|eval\(|innerHTML|srcdoc=|xlink:href|&#x?\w+;)/i;

  const sqlPattern =
    /('|"|;|--|\/\*|\*\/|#|\b(OR|AND)\b\s+\d+=\d+|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|UNION|XP_)\b|\b(CHAR|NCHAR|VARCHAR|NVARCHAR|CAST|CONVERT)\b|\b(SLEEP|BENCHMARK)\b)/i;

  return !xssPattern.test(value) && !sqlPattern.test(value);
};