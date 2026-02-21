export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Home, Calendar, Users, PlusCircle } from "lucide-react";

export default async function AdminDashboard() {
  // Отримуємо статистику з бази даних
  const [apartmentsCount, bookingsCount, recentBookings] = await Promise.all([
    prisma.apartment.count(),
    prisma.booking.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { apartment: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Навігація */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">Mikerent Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">admin@mikerent.com</span>
              <form action="/api/admin/logout" method="POST">
                <button className="text-sm text-red-600 hover:text-red-800">
                  Вийти
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Головний контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Картка: Квартири */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-blue-600">
                {apartmentsCount}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Всього квартир</h3>
            <Link
              href="/admin/apartments"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-2 inline-block"
            >
              Керувати квартирами →
            </Link>
          </div>

          {/* Картка: Бронювання */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-600">
                {bookingsCount}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Всього бронювань</h3>
            <Link
              href="/admin/bookings"
              className="text-sm text-green-600 hover:text-green-800 hover:underline mt-2 inline-block"
            >
              Переглянути бронювання →
            </Link>
          </div>

          {/* Картка: Адміни */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="text-gray-600 font-medium">Адміністратори</h3>
            <p className="text-sm text-gray-400 mt-2">Керування доступом</p>
          </div>
        </div>

        {/* Останні бронювання */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Останні бронювання</h2>
            <Link
              href="/admin/bookings"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Всі бронювання →
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {booking.guestName || "Не вказано"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.apartment?.title || "Квартира"} •{" "}
                      {new Date(booking.dateFrom).toLocaleDateString("uk-UA")} -{" "}
                      {new Date(booking.dateTo).toLocaleDateString("uk-UA")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status === "CONFIRMED"
                        ? "Підтверджено"
                        : booking.status === "PENDING"
                          ? "Очікує"
                          : "Скасовано"}
                    </span>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Деталі
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">Ще немає бронювань</p>
                <p className="text-sm">
                  Коли з'являться перші бронювання, вони з'являться тут
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Швидкі дії */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/apartments/new"
            className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Додати квартиру</h3>
                <p className="text-blue-100 text-sm">
                  Створити новий об'єкт для оренди
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/apartments"
            className="group bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Home className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Керувати квартирами
                </h3>
                <p className="text-green-100 text-sm">
                  Редагувати, видаляти, переглядати
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Інформація про систему */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Mikerent Admin Panel • {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  );
}
