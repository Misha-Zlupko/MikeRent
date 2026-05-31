export type TelegramSendOptions = {
  parseMode?: "HTML" | "Markdown";
};

export function isTelegramConfigured() {
  return Boolean(
    process.env.TELEGRAM_BOT_TOKEN?.trim() &&
      process.env.TELEGRAM_CHAT_ID?.trim(),
  );
}

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, "") ||
    "https://mikerent.com"
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function phoneLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const href = digits.startsWith("380")
    ? `+${digits}`
    : digits.startsWith("0")
      ? `+38${digits}`
      : phone;
  return `<a href="tel:${href}">${escapeHtml(phone)}</a>`;
}

function formatDates(from: Date | null | undefined, to: Date | null | undefined) {
  if (from && to) {
    return `${from.toLocaleDateString("uk-UA")} — ${to.toLocaleDateString("uk-UA")}`;
  }
  return "Не вказано";
}

type CardField = { label: string; value: string; rawHtml?: boolean };

function buildCard(params: {
  category: string;
  actionBadge: string;
  fields: CardField[];
  adminPath?: string;
  footerNote?: string;
}) {
  const line = "─────────────────";
  const body = params.fields
    .map(({ label, value, rawHtml }) => {
      const v = rawHtml ? value : escapeHtml(value);
      return `<b>${label}:</b> ${v}`;
    })
    .join("\n");

  const adminLink = params.adminPath
    ? `\n<a href="${siteUrl()}${params.adminPath}">Відкрити в адмінці →</a>`
    : "";

  const note = params.footerNote
    ? `\n<i>${escapeHtml(params.footerNote)}</i>`
    : "";

  return `
${line}
<b>${params.category}</b>
${params.actionBadge}
${line}

${body}${adminLink}
🕐 ${new Date().toLocaleString("uk-UA")}${note}
  `.trim();
}

export async function sendTelegramMessage(
  message: string,
  options?: TelegramSendOptions,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    console.warn(
      "[Telegram] Пропущено: додайте TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID у .env",
    );
    return false;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: message,
    disable_web_page_preview: true,
  };
  if (options?.parseMode) body.parse_mode = options.parseMode;

  const sendOnce = async () => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => ({}));
    return { response, payload };
  };

  let result = await sendOnce();
  if (!result.response.ok) result = await sendOnce();

  if (!result.response.ok) {
    console.error(
      "[Telegram] Помилка API:",
      result.response.status,
      JSON.stringify(result.payload),
    );
    throw new Error(
      `Telegram API error: ${result.response.status} ${JSON.stringify(result.payload)}`,
    );
  }

  return true;
}

export async function tryNotifyTelegram(message: string) {
  if (!isTelegramConfigured()) return false;
  try {
    return await sendTelegramMessage(message, { parseMode: "HTML" });
  } catch (error) {
    console.error("[Telegram] notify error:", error);
    return false;
  }
}

const housingTypeLabels: Record<string, string> = {
  APARTMENT: "Квартира",
  HOUSE: "Будинок",
  ROOM: "Номер",
  ANY: "Будь-яке",
};

const bookingStatusLabels: Record<string, string> = {
  PENDING: "⏳ Очікує",
  CONFIRMED: "✅ Підтверджено",
  CANCELLED: "🚫 Скасовано",
  REJECTED: "❌ Відхилено",
  NEW: "🆕 Нова",
  CALLED: "📞 Прозвонено",
  COMPLETED: "✔️ Оброблено",
};

// ── Підбір житла ──

export type HousingInquiryNotify = {
  inquiryNumber: string;
  name: string;
  phone: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number | null;
  housingType: string;
  withPets: boolean;
  petsDetails: string | null;
  comment: string | null;
};

function housingInquiryFields(inquiry: HousingInquiryNotify): CardField[] {
  const petsLine = inquiry.withPets
    ? inquiry.petsDetails || "Так"
    : "Ні";
  return [
    { label: "Номер", value: inquiry.inquiryNumber },
    { label: "Ім'я", value: inquiry.name },
    { label: "Телефон", value: phoneLink(inquiry.phone), rawHtml: true },
    {
      label: "Тип",
      value: housingTypeLabels[inquiry.housingType] ?? inquiry.housingType,
    },
    { label: "Гості", value: String(inquiry.guests ?? "—") },
    { label: "Тварини", value: petsLine },
    { label: "Дати", value: formatDates(inquiry.checkIn, inquiry.checkOut) },
    { label: "Побажання", value: inquiry.comment || "—" },
  ];
}

export async function notifyHousingInquiryNew(inquiry: HousingInquiryNotify) {
  return tryNotifyTelegram(
    buildCard({
      category: "🏠 ПІДБІР ЖИТЛА",
      actionBadge: "🆕 <b>Новий запит</b>",
      fields: housingInquiryFields(inquiry),
      adminPath: "/admin/housing-inquiries",
    }),
  );
}

/** @deprecated use notifyHousingInquiryNew */
export async function notifyHousingInquiryTelegram(inquiry: HousingInquiryNotify) {
  return notifyHousingInquiryNew(inquiry);
}

export async function notifyHousingInquiryProcessed(
  inquiry: HousingInquiryNotify,
  action: "CALLED" | "COMPLETED" | "REJECTED",
) {
  const badges = {
    CALLED: "📞 <b>Прозвонено</b>",
    COMPLETED: "✔️ <b>Оброблено</b>",
    REJECTED: "❌ <b>Відхилено</b>",
  };
  const notes = {
    CALLED: "Менеджер звʼязався з клієнтом",
    COMPLETED: "Запит закрито — житло підібрано або питання вирішено",
    REJECTED: "Запит відхилено",
  };

  return tryNotifyTelegram(
    buildCard({
      category: "🏠 ПІДБІР ЖИТЛА",
      actionBadge: badges[action],
      fields: housingInquiryFields(inquiry),
      adminPath: "/admin/housing-inquiries",
      footerNote: notes[action],
    }),
  );
}

// ── Заявка на бронювання (з сайту) ──

export type BookingRequestNotify = {
  bookingNumber: string;
  apartmentTitle: string;
  phone: string;
  comment: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  totalPrice: number;
};

function bookingRequestFields(req: BookingRequestNotify): CardField[] {
  return [
    { label: "Номер", value: req.bookingNumber },
    { label: "Житло", value: req.apartmentTitle },
    { label: "Телефон", value: phoneLink(req.phone), rawHtml: true },
    { label: "Дати", value: formatDates(req.checkIn, req.checkOut) },
    { label: "Ночей", value: String(req.nights) },
    { label: "Гості", value: String(req.guests) },
    { label: "Сума", value: `${req.totalPrice} ₴` },
    { label: "Коментар", value: req.comment || "—" },
  ];
}

export async function notifyBookingRequestNew(req: BookingRequestNotify) {
  return tryNotifyTelegram(
    buildCard({
      category: "📋 ЗАЯВКА НА БРОНЮВАННЯ",
      actionBadge: "🆕 <b>Нова заявка з сайту</b>",
      fields: bookingRequestFields(req),
      adminPath: "/admin/booking-requests",
    }),
  );
}

export async function notifyBookingRequestProcessed(
  req: BookingRequestNotify,
  action: "CALLED" | "CONFIRMED" | "REJECTED",
  extra?: { bookingId?: string; reason?: string },
) {
  const badges = {
    CALLED: "📞 <b>Прозвонено</b>",
    CONFIRMED: "✅ <b>Підтверджено → бронь створена</b>",
    REJECTED: "❌ <b>Відхилено</b>",
  };
  const notes = {
    CALLED: "Менеджер звʼязався з клієнтом",
    CONFIRMED: extra?.bookingId
      ? `Створено бронювання ID: ${extra.bookingId}`
      : "Заявку підтверджено",
    REJECTED: extra?.reason || "Заявку відхилено",
  };

  const fields = [...bookingRequestFields(req)];
  if (action === "CONFIRMED" && extra?.bookingId) {
    fields.push({ label: "Бронь ID", value: extra.bookingId });
  }

  return tryNotifyTelegram(
    buildCard({
      category: "📋 ЗАЯВКА НА БРОНЮВАННЯ",
      actionBadge: badges[action],
      fields,
      adminPath: "/admin/booking-requests",
      footerNote: notes[action],
    }),
  );
}

export async function notifyBookingRequestConfirmFailed(
  req: BookingRequestNotify,
  reason: string,
) {
  return tryNotifyTelegram(
    buildCard({
      category: "📋 ЗАЯВКА НА БРОНЮВАННЯ",
      actionBadge: "⚠️ <b>Не вдалося підтвердити</b>",
      fields: bookingRequestFields(req),
      adminPath: "/admin/booking-requests",
      footerNote: reason,
    }),
  );
}

// ── Бронювання на календарі ──

export type BookingNotify = {
  id: string;
  apartmentTitle: string;
  guestName: string | null;
  guestPhone: string | null;
  guestCount: number | null;
  dateFrom: Date;
  dateTo: Date;
  totalAmount: number | null;
  status: string;
  recordType?: string;
  source?: string;
};

function bookingFields(b: BookingNotify): CardField[] {
  const fields: CardField[] = [
    { label: "ID", value: b.id.slice(0, 8) + "…" },
    { label: "Житло", value: b.apartmentTitle },
    { label: "Статус", value: bookingStatusLabels[b.status] ?? b.status },
  ];
  if (b.guestName) fields.push({ label: "Гість", value: b.guestName });
  if (b.guestPhone) {
    fields.push({
      label: "Телефон",
      value: phoneLink(b.guestPhone),
      rawHtml: true,
    });
  }
  fields.push(
    { label: "Дати", value: formatDates(b.dateFrom, b.dateTo) },
    { label: "Гості", value: String(b.guestCount ?? "—") },
  );
  if (b.totalAmount != null) {
    fields.push({ label: "Сума", value: `${b.totalAmount} ₴` });
  }
  if (b.recordType && b.recordType !== "AGENCY") {
    fields.push({
      label: "Тип",
      value:
        b.recordType === "OWNER"
          ? "Зайнятість (хазяїн)"
          : "Зайнятість (інший)",
    });
  }
  if (b.source) fields.push({ label: "Джерело", value: b.source });
  return fields;
}

export async function notifyBookingNew(b: BookingNotify) {
  return tryNotifyTelegram(
    buildCard({
      category: "📅 БРОНЮВАННЯ",
      actionBadge: "🆕 <b>Нова бронь на квартирі</b>",
      fields: bookingFields(b),
      adminPath: "/admin/bookings",
      footerNote: "Дати зайняті в календарі",
    }),
  );
}

export async function notifyBookingStatusChanged(
  b: BookingNotify,
  previousStatus: string,
) {
  const prev = bookingStatusLabels[previousStatus] ?? previousStatus;
  const next = bookingStatusLabels[b.status] ?? b.status;

  return tryNotifyTelegram(
    buildCard({
      category: "📅 БРОНЮВАННЯ",
      actionBadge: `🔄 <b>Зміна статусу</b>\n${prev} → ${next}`,
      fields: bookingFields(b),
      adminPath: "/admin/bookings",
    }),
  );
}

export function mapHousingInquiryFromDb(inquiry: {
  inquiryNumber: string;
  name: string | null;
  phone: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  propertyType: string;
  hasPets: boolean;
  petsDescription: string | null;
  notes: string | null;
}): HousingInquiryNotify {
  return {
    inquiryNumber: inquiry.inquiryNumber,
    name: inquiry.name ?? "—",
    phone: inquiry.phone,
    checkIn: inquiry.checkIn,
    checkOut: inquiry.checkOut,
    guests: inquiry.adults + inquiry.children,
    housingType: inquiry.propertyType,
    withPets: inquiry.hasPets,
    petsDetails: inquiry.petsDescription,
    comment: inquiry.notes,
  };
}

export function mapBookingRequestFromDb(request: {
  bookingNumber: string;
  phone: string;
  comment: string | null;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  totalPrice: number;
  apartment: { title: string };
}): BookingRequestNotify {
  return {
    bookingNumber: request.bookingNumber,
    apartmentTitle: request.apartment.title,
    phone: request.phone,
    comment: request.comment,
    checkIn: request.checkIn,
    checkOut: request.checkOut,
    nights: request.nights,
    guests: request.guests,
    totalPrice: request.totalPrice,
  };
}

export function mapBookingFromDb(
  booking: {
    id: string;
    guestName: string | null;
    guestPhone: string | null;
    guestCount: number | null;
    dateFrom: Date;
    dateTo: Date;
    totalAmount: number | null;
    status: string;
    recordType?: string;
  },
  apartmentTitle: string,
  source?: string,
): BookingNotify {
  return {
    id: booking.id,
    apartmentTitle,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestCount: booking.guestCount,
    dateFrom: booking.dateFrom,
    dateTo: booking.dateTo,
    totalAmount: booking.totalAmount,
    status: booking.status,
    recordType: booking.recordType,
    source,
  };
}
