export const revalidate = 0;

import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Calendar, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

async function getApartments() {
  const apartments = await prisma.apartment.findMany({
    include: {
      bookings: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return apartments;
}

export default async function ApartmentsPage() {
  const apartments = await getApartments();

  return (
    <div className="container py-8">
      {/* Верхня панель з навігацією */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Назад до дашборду"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Керування квартирами
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
              href="/admin/apartments/new"
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Додати квартиру</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Всього квартир</p>
          <p className="text-2xl font-bold text-gray-900">
            {apartments.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Вільні зараз</p>
          <p className="text-2xl font-bold text-green-600">
            {
              apartments.filter((a) => {
                const today = new Date();
                const isBooked = a.bookings?.some(
                  (b) => b.dateFrom <= today && b.dateTo >= today,
                );
                return !isBooked;
              }).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Заброньовано</p>
          <p className="text-2xl font-bold text-orange-600">
            {
              apartments.filter((a) => {
                const today = new Date();
                return a.bookings?.some(
                  (b) => b.dateFrom <= today && b.dateTo >= today,
                );
              }).length
            }
          </p>
        </div>
      </div>

      {/* Таблиця квартир */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Фото
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Назва
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Місто
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Ціна/ніч
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Тип
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Рейтинг
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
              {apartments.map((apt) => {
                const today = new Date();
                const isBookedToday = apt.bookings?.some(
                  (b) => b.dateFrom <= today && b.dateTo >= today,
                );

                return (
                  <tr
                    key={apt.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      {apt.images?.[0] ? (
                        <img
                          src={apt.images[0]}
                          alt={apt.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {apt.title}
                      </div>
                      <div className="text-sm text-gray-500">{apt.address}</div>
                    </td>
                    <td className="p-4 text-gray-600">{apt.city}</td>
                    <td className="p-4">
                      <span className="font-medium text-gray-900">
                        ${apt.pricePerNight}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                        {apt.type.toLowerCase() === "apartment"
                          ? "Квартира"
                          : apt.type.toLowerCase() === "house"
                            ? "Будинок"
                            : "Кімната"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span>{apt.rating.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">
                          ({apt.reviewsCount})
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          isBookedToday
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isBookedToday ? "Заброньовано" : "Вільно"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/apartments/${apt.id}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Переглянути на сайті"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          href={`/admin/apartments/edit/${apt.id}`}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Редагувати"
                        >
                          <Pencil size={18} />
                        </Link>
                        <DeleteButton id={apt.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {apartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Поки немає квартир</p>
            <Link
              href="/admin/apartments/new"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-2"
            >
              <Plus size={16} />
              Додати першу квартиру
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
