import { prisma } from "@/lib/prisma";

export const DEFAULT_MESSAGE_TEMPLATES = [
  {
    slug: "confirmation",
    title: "Підтвердження бронювання",
    body: "Вітаємо, {{guestName}}! Бронювання підтверджено: {{apartmentTitle}}, {{dateFrom}} – {{dateTo}}. Загальна сума: {{total}} грн.",
  },
  {
    slug: "checkin_address",
    title: "Адреса заїзду",
    body: "{{guestName}}, чекаємо вас {{dateFrom}}! Адреса: {{address}}. Контакт: {{contactPhone}}.",
  },
  {
    slug: "balance_reminder",
    title: "Нагадування про доплату",
    body: "{{guestName}}, нагадуємо: залишок до оплати {{remaining}} грн при заїзді {{dateFrom}}. Дякуємо!",
  },
] as const;

export async function ensureMessageTemplates() {
  for (const t of DEFAULT_MESSAGE_TEMPLATES) {
    await prisma.messageTemplate.upsert({
      where: { slug: t.slug },
      create: { slug: t.slug, title: t.title, body: t.body },
      update: {},
    });
  }
}

export function fillTemplate(
  body: string,
  vars: Record<string, string | number | undefined | null>,
) {
  let out = body;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, val != null ? String(val) : "");
  }
  return out;
}
