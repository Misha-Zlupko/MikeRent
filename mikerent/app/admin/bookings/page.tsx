export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Plus,
  Calendar,
  Eye,
  ExternalLink,
  Phone,
  User,
  DollarSign,
  Pencil,
  Trash2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteBookingButton from "@/components/admin/bookings/DeleteBookingButton";

async function getBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      apartment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return bookings;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calculateNights(dateFrom: Date, dateTo: Date) {
  const diffTime = Math.abs(
    new Date(dateTo).getTime() - new Date(dateFrom).getTime(),
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="container py-8">
      {/* Верхня панель */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Назад до дашборду"
            >
              <Calendar size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Керування бронюваннями
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString("uk-UA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <Link
            href="/admin/bookings/new"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Додати бронювання</span>
          </Link>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Всього бронювань</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Активні зараз</p>
          <p className="text-2xl font-bold text-green-600">
            {
              bookings.filter((b) => {
                const today = new Date();
                return b.dateFrom <= today && b.dateTo >= today;
              }).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Майбутні</p>
          <p className="text-2xl font-bold text-blue-600">
            {bookings.filter((b) => b.dateFrom > new Date()).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Завершені</p>
          <p className="text-2xl font-bold text-gray-600">
            {bookings.filter((b) => b.dateTo < new Date()).length}
          </p>
        </div>
      </div>

      {/* Таблиця бронювань */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Квартира
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Гість
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Дата
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Сума (грн)
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Хазяїну (грн)
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Наш прибуток (грн)
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Статус
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const nights = calculateNights(
                  booking.dateFrom,
                  booking.dateTo,
                );
                const today = new Date();
                const isActive =
                  booking.dateFrom <= today && booking.dateTo >= today;
                const isFuture = booking.dateFrom > today;

                // 👇 ВИКОРИСТОВУЄМО ЗВИЧАЙНІ ПОЛЯ, АЛЕ ВВАЖАЄМО ЇХ ГРИВНЯМИ
                const totalAmount = booking.totalAmount;
                const ownerPayout = booking.ownerPayout;
                const ourProfit = booking.ourProfit;

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        <Link
                          href={`/apartments/${booking.apartment.id}`}
                          target="_blank"
                          className="hover:text-blue-600 flex items-center gap-1"
                        >
                          {booking.apartment.title}
                          <ExternalLink size={14} className="text-gray-400" />
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.apartment.city}
                      </div>
                      {booking.apartment.ownerPhone && (
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          <span className="text-gray-500">Хазяїн:</span>
                          <a
                            href={`tel:${booking.apartment.ownerPhone.replace(/\s/g, "")}`}
                            className="text-blue-600 hover:underline"
                          >
                            {booking.apartment.ownerPhone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {booking.guestName || "—"}
                      </div>
                      {booking.guestPhone && (
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone size={12} />
                          {booking.guestPhone}
                        </div>
                      )}
                      {booking.guestCount && (
                        <div className="text-sm text-gray-500">
                          {booking.guestCount} осіб
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900">
                        {formatDate(booking.dateFrom)} —{" "}
                        {formatDate(booking.dateTo)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {nights} ночей
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {totalAmount ? `${totalAmount.toFixed(2)} грн` : "—"}
                      </div>
                      {totalAmount && (
                        <div className="text-sm text-gray-500">
                          {(totalAmount / nights).toFixed(2)} грн/ніч
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-gray-900">
                        {ownerPayout ? `${ownerPayout.toFixed(2)} грн` : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-green-600">
                        {ourProfit ? `${ourProfit.toFixed(2)} грн` : "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : isFuture
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isActive
                          ? "Активне"
                          : isFuture
                            ? "Заплановане"
                            : "Завершене"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/bookings/edit/${booking.id}`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редагувати"
                        >
                          <Pencil size={18} />
                        </Link>
                        <DeleteBookingButton id={booking.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Поки немає бронювань</p>
            <Link
              href="/admin/bookings/new"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus size={16} />
              Додати перше бронювання
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
