"use client";

import { useEffect, useRef, useState } from "react";
import { History, StickyNote } from "lucide-react";
import Link from "next/link";

type Props = {
  guestPhone: string;
  guestName: string;
  guestNotes: string;
  onGuestNotesChange: (v: string) => void;
  excludeBookingId?: string;
  templateVars?: Record<string, string | number | undefined | null>;
};

type PastBooking = {
  id: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  apartmentTitle: string;
  city: string;
};

export default function GuestHistoryPanel({
  guestPhone,
  guestName,
  guestNotes,
  onGuestNotesChange,
  excludeBookingId,
}: Props) {
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const notesHydrated = useRef(false);

  useEffect(() => {
    const phone = guestPhone.trim();
    if (phone.length < 9) {
      setPastBookings([]);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      const q = new URLSearchParams({ phone });
      if (excludeBookingId) q.set("excludeBookingId", excludeBookingId);
      fetch(`/api/admin/guests/by-phone?${q}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.guest?.notes && !notesHydrated.current) {
            notesHydrated.current = true;
            onGuestNotesChange(data.guest.notes);
          }
          setPastBookings(data.pastBookings ?? []);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [guestPhone, excludeBookingId, onGuestNotesChange]);

  if (guestPhone.trim().length < 9) return null;

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-900">
        <History size={18} />
        Історія гостя ({guestName || "за телефоном"})
      </h3>
      {loading ? (
        <p className="text-xs text-gray-500">Завантаження…</p>
      ) : pastBookings.length > 0 ? (
        <ul className="mb-3 space-y-1 text-sm">
          {pastBookings.slice(0, 5).map((b) => (
            <li key={b.id}>
              <Link
                href={`/admin/bookings/edit/${b.id}`}
                className="text-indigo-700 hover:underline"
              >
                {b.apartmentTitle} ({b.city}) —{" "}
                {new Date(b.dateFrom).toLocaleDateString("uk-UA")} • {b.status}
              </Link>
            </li>
          ))}
          {pastBookings.length > 5 && (
            <li className="text-xs text-gray-500">
              ще {pastBookings.length - 5} бронювань
            </li>
          )}
        </ul>
      ) : (
        <p className="mb-3 text-xs text-gray-600">Перше бронювання з цим номером.</p>
      )}
      <label className="flex items-start gap-2 text-sm">
        <StickyNote size={16} className="mt-1 shrink-0 text-indigo-600" />
        <textarea
          value={guestNotes}
          onChange={(e) => onGuestNotesChange(e.target.value)}
          placeholder="Нотатки: любить тихий поверх, без дітей…"
          rows={2}
          className="w-full rounded border border-indigo-200 bg-white p-2 text-sm"
        />
      </label>
    </div>
  );
}
