export function normalizePhone(input: string) {
  return input.replace(/\s+/g, "").trim();
}

/** Ключ для історії гостя: лише цифри, останні 10 (UA). */
export function normalizeGuestPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

// UA-focused: 0981234567 or +380981234567 or 380981234567
export function isValidUkrainianPhone(input: string) {
  const cleaned = normalizePhone(input);
  return /^(\+?38)?0\d{9}$/.test(cleaned);
}

