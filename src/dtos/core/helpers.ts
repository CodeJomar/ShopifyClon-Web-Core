/**
 * Formato identificador estándar UUID v4
 */
export type UUID = string;

/**
 * Numeric ID donde 0 representa ausencia de selección
 */
export type OptionalNumericID = number;

/**
 * Identificador numérico positivo (> 0)
 */
export type NumericID = number;

export type NumberAsString = `${number}`;

export type EmptyString = "";

export type OptionalData<T> = T | null | undefined;

// Constructor flexible tipado para instanciación
// biome-ignore lint/suspicious/noExplicitAny: Constructor genérico para instanciación por reflexión
export type ConstructorLike<T> = new (data: any) => T;

export type LocalDateString = `${string}/${string}/${number}`;
export type LocalDateTimeString = `${string}/${string}/${number} ${string}:${string}:${string}`;
export type LocalDateTimeString12H = `${string}/${string}/${number} ${string}:${string}:${string} ${"AM" | "PM"}`;
export type LocalTimeString12H = `${string}:${string} ${"AM" | "PM"}`;
export type ISOTimeString = `${string}:${string}`;
export type TimePlaceholder = `--:--`;