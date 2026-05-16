export type FieldErrors = Record<string, string>;

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
};

export const emptyActionState: ActionState = { ok: false };

export function parseCsv(input: unknown): string[] {
  return String(input ?? "")
    .split(",")
    .map((s) => normalizeTagName(s))
    .filter(Boolean);
}

export function nonEmptyOrNull(value: unknown): string | null {
  const v = String(value ?? "").trim();
  return v.length ? v : null;
}

export function strOrEmpty(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeTagName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b[\p{L}\p{N}]/gu, (c) => c.toUpperCase());
}

export function parseOptionalInteger(value: unknown): number | null {
  const raw = strOrEmpty(value);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function parseOptionalDate(value: unknown): Date | null {
  const raw = strOrEmpty(value);
  if (!raw) return null;
  const parsed = new Date(`${raw}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidUrlOrEmpty(value: string | null) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function pickEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
): T[number] | null {
  const raw = strOrEmpty(value);
  return allowed.includes(raw) ? raw : null;
}

export function fieldError(fieldErrors: FieldErrors, field: string, message: string) {
  if (!fieldErrors[field]) fieldErrors[field] = message;
}

export function parseIndexedRows(fd: FormData, prefix: string): Record<string, string | null>[] {
  const rows: Record<string, string | null>[] = [];
  let idx = 0;
  while (fd.has(`${prefix}[${idx}][type]`) || fd.has(`${prefix}[${idx}][amount]`)) {
    const type = strOrEmpty(fd.get(`${prefix}[${idx}][type]`));
    const amount = strOrEmpty(fd.get(`${prefix}[${idx}][amount]`));
    const currency = strOrEmpty(fd.get(`${prefix}[${idx}][currency]`)) || "USD";
    const description = nonEmptyOrNull(fd.get(`${prefix}[${idx}][description]`));
    rows.push({ type, amount, currency, description });
    idx++;
  }
  return rows;
}

