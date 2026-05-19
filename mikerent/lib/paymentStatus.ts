import type { PaymentStatus } from "@prisma/client";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Не оплачено",
  PREPAID_RECEIVED: "Передоплата отримана",
  BALANCE_AT_CHECKIN: "Залишок при заїзді",
  PAID_IN_FULL: "Все оплачено",
};

export const PAYMENT_STATUS_OPTIONS = (
  Object.keys(PAYMENT_STATUS_LABELS) as PaymentStatus[]
).map((value) => ({
  value,
  label: PAYMENT_STATUS_LABELS[value],
}));
