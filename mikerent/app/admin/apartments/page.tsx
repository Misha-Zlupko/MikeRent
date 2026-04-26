export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Pencil, Eye, ArrowLeft, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import CallCheckButton from "@/components/admin/CallCheckButton";

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
  const now = Date.now();
  const twelveHoursMs = 12 * 60 * 60 * 1000;
  const needCallCount = apartments.filter((a) => {
    const calledAt = (a as typeof a & { lastCalledAt?: Date | null })
      .lastCalledAt;
    if (!calledAt) return true;
    return now - new Date(calledAt).getTime() >= twelveHoursMs;
  }).length;
  const exclusiveApartments = apartments.filter((a) => {
    const category = (a as typeof a & { category?: string }).category;
    return (category || "EXCLUSIVE") === "EXCLUSIVE";
  });
  const sharedApartments = apartments.filter((a) => {
    const category = (a as typeof a & { category?: string }).category;
    return category === "SHARED";
  });

  const renderRows = (rows: typeof apartments) =>
    rows.map((apt) => {
      const today = new Date();
      const isBookedToday = apt.bookings?.some(
        (b) => b.dateFrom <= today && b.dateTo >= today,
      );
      const category = (apt as typeof apt & { category?: string }).category;
      const categoryLabel =
        category === "SHARED"
          ? "Спільна (щоденний прозвон)"
          : "Ексклюзивна (тільки Mikerent)";
      const lastCalledAt = (apt as typeof apt & { lastCalledAt?: Date | null })
        .lastCalledAt;
      const isCallExpired =
        !lastCalledAt ||
        now - new Date(lastCalledAt).getTime() >= twelveHoursMs;
      const callLabel = isCallExpired ? "Потрібен прозвон" : "Прозвонено";

      return (
        <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
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
            <div className="font-medium text-gray-900">{apt.title}</div>
            <div className="text-sm text-gray-500">{apt.address}</div>
          </td>
          <td className="p-4 text-gray-600">{apt.city}</td>
          <td className="p-4">
            {apt.ownerPhone ? (
              <a
                href={`tel:${apt.ownerPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1 text-sm text-gray-900 hover:text-blue-600"
              >
                <Phone size={14} className="shrink-0 text-gray-400" />
                {apt.ownerPhone}
              </a>
            ) : (
              <span className="text-sm text-gray-400">—</span>
            )}
          </td>
          <td className="p-4">
            <span className="font-medium text-gray-900">${apt.pricePerNight}</span>
          </td>
          <td className="p-4">
            <div className="flex flex-col gap-1">
              <span
                className={`px-2 py-1 rounded-full text-xs w-fit ${
                  isCallExpired
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {callLabel}
              </span>
              {lastCalledAt && (
                <span className="text-[11px] text-gray-500">
                  {new Date(lastCalledAt).toLocaleString("uk-UA")}
                </span>
              )}
              <CallCheckButton id={apt.id} />
            </div>
          </td>
          <td className="p-4">
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
              {categoryLabel}
            </span>
          </td>
          <td className="p-4">
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
              {apt.type === "APARTMENT"
                ? "Квартира"
                : apt.type === "HOUSE"
                  ? "Будинок"
                  : "Кімната"}
            </span>
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
    });

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
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Всього квартир</p>
          <p className="text-2xl font-bold text-gray-900">
            {apartments.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Ексклюзивні</p>
          <p className="text-2xl font-bold text-indigo-700">
            {exclusiveApartments.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Спільні (прозвон)</p>
          <p className="text-2xl font-bold text-amber-700">
            {sharedApartments.length}
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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Потрібен прозвон</p>
          <p className="text-2xl font-bold text-red-600">{needCallCount}</p>
        </div>
      </div>

      {/* Група 1: Ексклюзивні */}
      <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl px-4 py-3 mb-3 text-sm">
        Ексклюзивні квартири — заселяє тільки Mikerent.
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Група 1: Ексклюзивні</h3>
        </div>
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
                  Тел. хазяїна
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Ціна/ніч
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Прозвон
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Група
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Тип
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
              {renderRows(exclusiveApartments)}
            </tbody>
          </table>
        </div>
        {exclusiveApartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Поки немає ексклюзивних квартир</p>
          </div>
        )}
      </div>

      {/* Група 2: Спільні */}
      <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-xl px-4 py-3 mb-3 text-sm">
        Спільні квартири — заселяє не тільки Mikerent, рекомендується
        щоденний ранковий прозвон.
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Група 2: Спільні</h3>
        </div>
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
                  Тел. хазяїна
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Ціна/ніч
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Прозвон
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Група
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Тип
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Статус
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">{renderRows(sharedApartments)}</tbody>
          </table>
        </div>
        {sharedApartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Поки немає спільних квартир</p>
          </div>
        )}
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
  );
}