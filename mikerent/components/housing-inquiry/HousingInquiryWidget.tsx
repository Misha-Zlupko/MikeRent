"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, X, Send, Loader2 } from "lucide-react";

type HousingType = "ANY" | "APARTMENT" | "HOUSE" | "ROOM";

const typeOptions: { value: HousingType; label: string }[] = [
  { value: "ANY", label: "Будь-яке" },
  { value: "APARTMENT", label: "Квартира" },
  { value: "HOUSE", label: "Будинок" },
  { value: "ROOM", label: "Номер" },
];

export function HousingInquiryWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [housingType, setHousingType] = useState<HousingType>("ANY");
  const [withPets, setWithPets] = useState(false);
  const [petsDetails, setPetsDetails] = useState("");
  const [comment, setComment] = useState("");
  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) {
      setOpen(false);
    }
  }, [isAdminRoute]);

  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  if (isAdminRoute) {
    return null;
  }

  const resetForm = () => {
    setName("");
    setPhone("");
    setCheckIn("");
    setCheckOut("");
    setGuests("2");
    setHousingType("ANY");
    setWithPets(false);
    setPetsDetails("");
    setComment("");
    setError(null);
  };

  const close = () => {
    setOpen(false);
    if (success) {
      setSuccess(null);
      resetForm();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/housing-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          checkIn: checkIn || null,
          checkOut: checkOut || null,
          guests: guests ? Number(guests) : null,
          housingType,
          withPets,
          petsDetails: withPets ? petsDetails.trim() || null : null,
          comment: comment || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Не вдалося надіслати запит");
        return;
      }

      setSuccess(data.inquiryNumber || "OK");
    } catch {
      setError("Помилка мережі. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-4 z-[280] flex items-center gap-2 rounded-full bg-main px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-main/25 transition hover:bg-sky-500 active:scale-[0.98] max-sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:bottom-6 sm:right-6 sm:px-5"
          aria-label="Залишити запит на житло"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span className="hidden sm:inline">Запит на житло</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pb-6 max-sm:pt-12 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            aria-label="Закрити"
            onClick={close}
          />

          <div className="relative z-[301] max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:max-h-[92vh] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Запит на підбір житла
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Менеджер передзвонить і підбере варіанти під ваші побажання
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {success ? (
              <div className="rounded-xl bg-sky-50 px-4 py-6 text-center">
                <p className="mb-2 font-semibold text-slate-900">
                  Дякуємо! Запит надіслано
                </p>
                <p className="mb-4 text-sm text-slate-600">
                  Номер запиту:{" "}
                  <span className="font-mono font-medium">{success}</span>
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl bg-main px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Закрити
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Ваше ім&apos;я *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    placeholder="Олена"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Телефон *
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    placeholder="+380 XX XXX XX XX"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Заїзд
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Виїзд
                    </label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Гості
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Тип житла
                    </label>
                    <select
                      value={housingType}
                      onChange={(e) =>
                        setHousingType(e.target.value as HousingType)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    >
                      {typeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Домашні тварини
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWithPets(false);
                        setPetsDetails("");
                      }}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        !withPets
                          ? "border-main bg-sky-50 text-main"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      Ні
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithPets(true)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        withPets
                          ? "border-main bg-sky-50 text-main"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      Так
                    </button>
                  </div>
                  {withPets && (
                    <input
                      value={petsDetails}
                      onChange={(e) => setPetsDetails(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                      placeholder="Напр.: собака, кіт..."
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Побажання
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
                    placeholder="Район, бюджет, поверх, біля моря..."
                  />
                </div>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-main py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Надіслати запит
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
