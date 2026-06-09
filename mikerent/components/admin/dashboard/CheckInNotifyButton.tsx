"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

export function CheckInNotifyButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/check-ins/notify", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        skipped?: boolean;
        reason?: string;
        checkInsCount?: number;
        telegramSent?: boolean;
        dateLabel?: string;
      };

      if (!res.ok) {
        setMessage(data.error ?? "Помилка відправки");
        return;
      }

      if (data.skipped && data.reason === "no_check_ins_today") {
        setMessage("Сьогодні заселень немає — повідомлення не надіслано.");
        return;
      }

      if (data.telegramSent) {
        setMessage(
          `Надіслано в Telegram: ${data.checkInsCount ?? 0} заселень на ${data.dateLabel ?? "сьогодні"}.`,
        );
        return;
      }

      setMessage("Заселення знайдено, але Telegram не відповів.");
    } catch {
      setMessage(
        "Не вдалося з'єднатися з сервером. Перезапустіть npm run dev і спробуйте знову.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
          <BellRing className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900">Заселення сьогодні</h3>
          <p className="mt-1 text-sm text-gray-600">
            Щодня о 00:00 (Київ) у Telegram приходить список квартир з адресою та
            контактами хазяїна. Можна надіслати вручну зараз.
          </p>
          <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Надсилання…" : "Надіслати зараз"}
          </button>
          {message ? (
            <p className="mt-2 text-sm text-gray-700">{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
