export const dynamic = "force-dynamic";

import Link from "next/link";
import { Home, MessageSquarePlus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import HousingInquiryActions from "@/components/admin/housing-inquiries/HousingInquiryActions";

const typeLabels: Record<string, string> = {
  APARTMENT: "Квартира",
  HOUSE: "Будинок",
  ROOM: "Номер",
  ANY: "Будь-яке",
};

export default async function HousingInquiriesPage() {
  const inquiries = await prisma.housingInquiry.findMany({
    where: { status: { in: ["NEW", "CALLED"] } },
    orderBy: [{ createdAt: "desc" }],
  });

  return (
    <div className="container py-8">
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-gray-500 transition-colors hover:text-gray-700"
            title="Назад до дашборду"
          >
            <Home size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Запити на підбір житла
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Заявки з віджета на сайті. Менеджер передзвонює клієнту.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <p className="font-medium text-gray-800">Активні запити</p>
          <span className="text-sm text-gray-500">{inquiries.length} шт.</span>
        </div>

        {inquiries.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            <MessageSquarePlus className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            Наразі немає нових запитів
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Номер:{" "}
                    <span className="font-mono text-gray-900">
                      {inquiry.inquiryNumber}
                    </span>
                    <span className="ml-3 text-xs text-gray-400">
                      {new Date(inquiry.createdAt).toLocaleString("uk-UA")}
                    </span>
                  </p>
                  <p className="font-semibold text-gray-900">
                    {inquiry.name} · {inquiry.phone}
                  </p>
                  <p className="text-sm text-gray-700">
                    {typeLabels[inquiry.propertyType] ?? inquiry.propertyType}
                    {` · ${inquiry.adults + inquiry.children} гостей`}
                  </p>
                  {inquiry.checkIn && inquiry.checkOut ? (
                    <p className="text-sm text-gray-600">
                      {inquiry.checkIn.toLocaleDateString("uk-UA")} —{" "}
                      {inquiry.checkOut.toLocaleDateString("uk-UA")}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Дати не вказані</p>
                  )}
                  <p className="text-sm text-gray-700">
                    Домашні тварини:{" "}
                    {inquiry.hasPets
                      ? inquiry.petsDescription || "Так"
                      : "Ні"}
                  </p>
                  {inquiry.notes ? (
                    <p className="text-sm text-gray-500">
                      Побажання: {inquiry.notes}
                    </p>
                  ) : null}
                </div>

                <HousingInquiryActions
                  inquiryId={inquiry.id}
                  calledAt={
                    inquiry.calledAt ? inquiry.calledAt.toISOString() : null
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
