export const dynamic = "force-dynamic";

import Link from "next/link";
import { ClipboardList, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import RequestActions from "@/components/admin/booking-requests/RequestActions";

export default async function BookingRequestsPage() {
  const prismaAny = prisma as typeof prisma & {
    bookingRequest: {
      findMany: (args: unknown) => Promise<any[]>;
    };
  };
  const requests = await prismaAny.bookingRequest.findMany({
    where: { status: { in: ["NEW", "CALLED"] } },
    include: { apartment: true },
    orderBy: [{ checkIn: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="container py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Назад до дашборду"
          >
            <Calendar size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Заявки на бронювання</h1>
            <p className="text-sm text-gray-500 mt-1">
              Нові заявки з сайту. Після підтвердження вони переходять у бронювання.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="font-medium text-gray-800">Активні заявки</p>
          <span className="text-sm text-gray-500">{requests.length} шт.</span>
        </div>

        {requests.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            Наразі немає нових заявок
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((request) => (
              <div
                key={request.id}
                className="px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    {request.apartment.images?.[0] ? (
                      <img
                        src={request.apartment.images[0]}
                        alt={request.apartment.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Без фото
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Номер заявки:{" "}
                    <span className="font-mono text-gray-900">{request.bookingNumber}</span>
                  </p>
                    <p className="font-semibold text-gray-900">
                      {request.apartment.title} • {request.apartment.city}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <Link
                        href={`/apartments/${request.apartment.id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Відкрити квартиру на сайті
                      </Link>
                      <Link
                        href={`/admin/apartments/edit/${request.apartment.id}`}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Редагувати в адмінці
                      </Link>
                    </div>
                  <p className="text-sm text-gray-700">Телефон: {request.phone}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(request.checkIn).toLocaleDateString("uk-UA")} -{" "}
                    {new Date(request.checkOut).toLocaleDateString("uk-UA")} •{" "}
                    {request.nights} ночей • {request.guests} гостей
                  </p>
                  <p className="text-xs text-gray-500">Заїзд з 14:00, виїзд до 12:00</p>
                  <p className="text-sm text-gray-700">
                    Сума: <span className="font-medium">{request.totalPrice} грн</span>
                  </p>
                  {request.comment ? (
                    <p className="text-sm text-gray-500">Коментар: {request.comment}</p>
                  ) : null}
                  </div>
                </div>

                <RequestActions
                  requestId={request.id}
                  calledAt={request.calledAt ? request.calledAt.toISOString() : null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
