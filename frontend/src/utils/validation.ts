/** Client-side checks that mirror the API's Bean Validation rules. The server remains the authority. */
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^[+0-9][0-9 ().-]{6,24}$/,
  time: /^([01]\d|2[0-3]):[0-5]\d$/,
}

export type Errors<T> = Partial<Record<keyof T | string, string>>

export function required(value: string | null | undefined, label: string): string | undefined {
  return value && value.trim() ? undefined : `${label} is required`
}

export function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean)
}
