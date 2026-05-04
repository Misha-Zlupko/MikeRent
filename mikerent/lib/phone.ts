export function normalizePhone(input: string) {
  return input.replace(/\s+/g, "").trim();
}

// UA-focused: 0981234567 or +380981234567 or 380981234567
export function isValidUkrainianPhone(input: string) {
  const cleaned = normalizePhone(input);
  return /^(\+?38)?0\d{9}$/.test(cleaned);
}

