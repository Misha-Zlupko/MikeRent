"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BookingForm, {
  type InitialBookingValues,
} from "@/components/admin/bookings/BookingForm";

type BookingApi = {
  id: string;
  apartmentId: string;
  dateFrom: string;
  dateTo: string;
  guestName: string | null;
  guestPhone: string | null;
  guestCount: number | null;
  guestContact: string | null;
  ownerPhone: string | null;
  totalAmount: number | null;
  ownerPayout: number | null;
  ourProfit: number | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  apartment: {
    id: string;
    title: string;
    city: string;
    pricePerNight: number;
  };
};

export default function EditBookingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingApi | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadError(null);
      try {
        const res = await fetch(`/api/admin/bookings/${id}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (res.status === 404) {
          if (!cancelled) setLoadError("Бронювання не знайдено");
          return;
        }
        if (!res.ok) {
          if (!cancelled) setLoadError("Помилка завантаження");
          return;
        }
        const data = (await res.json()) as BookingApi;
        if (!cancelled) setBooking(data);
      } catch {
        if (!cancelled) setLoadError("Помилка мережі");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const initialBooking: InitialBookingValues | null = useMemo(() => {
    if (!booking?.apartment) return null;
    return {
      apartment: {
        id: booking.apartment.id,
        title: booking.apartment.title,
        city: booking.apartment.city,
        pricePerNight: booking.apartment.pricePerNight,
      },
      dateFrom: booking.dateFrom,
      dateTo: booking.dateTo,
      guestName: booking.guestName,
      guestPhone: booking.guestPhone,
      guestCount: booking.guestCount,
      guestContact: booking.guestContact,
      ownerPhone: booking.ownerPhone,
      totalAmount: booking.totalAmount,
      ownerPayout: booking.ownerPayout,
      ourProfit: booking.ourProfit,
      status: booking.status,
    };
  }, [booking]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/bookings");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Помилка оновлення");
      }
    } catch {
      alert("Помилка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/bookings"
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-bold">Редагувати бронювання</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
            {loadError}
            <div className="mt-3">
              <Link
                href="/admin/bookings"
                className="text-blue-600 hover:underline text-sm"
              >
                Повернутися до списку
              </Link>
            </div>
          </div>
        )}

        {!loadError && !initialBooking && (
          <p className="text-gray-600">Завантаження...</p>
        )}

        {initialBooking && (
          <BookingForm
            key={id}
            initialBooking={initialBooking}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Зберегти зміни"
          />
        )}
      </main>
    </div>
  );
}
