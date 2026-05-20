export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BookingsListClient, {
  type BookingRowSerialized,
} from "@/components/admin/bookings/BookingsListClient";
import ExportTools from "@/components/admin/ExportTools";
import { isActiveBookingStatus } from "@/lib/bookingStatus";
import { agencyBookingWhere } from "@/lib/bookingRecordType";
import { getAdminSession } from "@/lib/adminAuth";
import { canDeleteBookings } from "@/lib/adminPermissions";

async function getBookings() {
  return prisma.booking.findMany({
    where: agencyBookingWhere,
    include: {
      apartment: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

function serializeBookings(
  rows: Awaited<ReturnType<typeof getBookings>>,
): BookingRowSerialized[] {
  return rows.map((b) => ({
    id: b.id,
    dateFrom: b.dateFrom.toISOString(),
    dateTo: b.dateTo.toISOString(),
    guestName: b.guestName,
    guestPhone: b.guestPhone,
    guestCount: b.guestCount,
    guestContact: b.guestContact,
    totalAmount: b.totalAmount,
    ownerPayout: b.ownerPayout,
    ourProfit: b.ourProfit,
    prepaidToMe: b.prepaidToMe,
    prepaidToOwner: b.prepaidToOwner,
    paymentStatus: b.paymentStatus,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    apartment: {
      id: b.apartment.id,
      title: b.apartment.title,
      city: b.apartment.city,
      ownerPhone: b.apartment.ownerPhone ?? null,
    },
  }));
}

export default async function BookingsPage() {
  const session = await getAdminSession();
  const canRemoveBookings = session ? canDeleteBookings(session) : false;
  const raw = await getBookings();
  const bookings = serializeBookings(raw);
  const today = new Date();

  const activeCount = raw.filter(
    (b) =>
      b.dateFrom <= today &&
      b.dateTo >= today &&
      isActiveBookingStatus(b.status),
  ).length;
  const futureCount = raw.filter(
    (b) => b.dateFrom > today && isActiveBookingStatus(b.status),
  ).length;
  const pastCount = raw.filter((b) => b.dateTo < today).length;

  return (
    <div className="container py-8">
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
                Лише ваші клієнти. Зайнятість хазяїна / іншого рієлтора — у
                картці квартири.
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {new Date().toLocaleDateString("uk-UA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ExportTools compact />
            <Link
              href="/admin/bookings/new"
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Додати бронювання</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Всього бронювань</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Зараз заселені</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Майбутні заїзди</p>
          <p className="text-2xl font-bold text-blue-600">{futureCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Завершені (дати)</p>
          <p className="text-2xl font-bold text-gray-600">{pastCount}</p>
        </div>
      </div>

      <BookingsListClient
        bookings={bookings}
        canDeleteBookings={canRemoveBookings}
      />
    </div>
  );
}
