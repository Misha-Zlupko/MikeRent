"use client";

import { useState, useEffect } from "react";
import ApartmentSelector from "./ApartmentSelector";
import DateSelector from "./DateSelector";
import GuestInfo from "./GuestInfo";
import FinancialSection from "./FinancialSection";
import FormActions from "./FormActions";
import { ClipboardList } from "lucide-react";
import { BOOKING_AMOUNT_UAH_FACTOR } from "@/lib/bookingAmounts";

export type InitialBookingValues = {
  apartment: {
    id: string;
    title: string;
    city: string;
    pricePerNight: number;
  };
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
};

type BookingFormProps = {
  onSubmit: (data: Record<string, unknown>) => void;
  loading: boolean;
  initialBooking?: InitialBookingValues | null;
  submitLabel?: string;
};

/** Гривні з 2 знаками після коми — без 1199.9999998 через float */
function roundMoney2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export default function BookingForm({
  onSubmit,
  loading,
  initialBooking,
  submitLabel,
}: BookingFormProps) {
  const [selectedApartment, setSelectedApartment] = useState<{
    id: string;
    title: string;
    city: string;
    pricePerNight: number;
  } | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestContact, setGuestContact] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [status, setStatus] = useState<
    "PENDING" | "CONFIRMED" | "CANCELLED"
  >("CONFIRMED");

  // Стан для передоплати
  const [prepaidTo, setPrepaidTo] = useState<"me" | "owner">("me");

  // Фінансові показники в гривнях
  const [ownerPricePerNight, setOwnerPricePerNight] = useState(0); // грн/ніч
  const [markupPerNight, setMarkupPerNight] = useState(0); // грн/ніч (мій прибуток)
  const [paidAmount, setPaidAmount] = useState(0); // грн (передоплата)

  // Розрахунок ночей
  const nights =
    dateFrom && dateTo
      ? Math.ceil(
          Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  // Фінансові розрахунки в гривнях (округлення — щоб не «плили» суми в UI)
  const ownerTotalPrice = roundMoney2(ownerPricePerNight * nights);
  const clientTotal = roundMoney2(
    (ownerPricePerNight + markupPerNight) * nights,
  );
  const ourProfit = roundMoney2(markupPerNight * nights);
  const remainingToPay = roundMoney2(clientTotal - paidAmount);

  useEffect(() => {
    if (!initialBooking) return;

    const apt = initialBooking.apartment;
    setSelectedApartment({
      id: apt.id,
      title: apt.title,
      city: apt.city,
      pricePerNight: apt.pricePerNight,
    });

    const from = new Date(initialBooking.dateFrom);
    const to = new Date(initialBooking.dateTo);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));

    setGuestName(initialBooking.guestName ?? "");
    setGuestPhone(initialBooking.guestPhone ?? "");
    setGuestCount(initialBooking.guestCount ?? 1);
    setGuestContact(initialBooking.guestContact ?? "");
    setOwnerPhone(initialBooking.ownerPhone ?? "");
    setStatus(initialBooking.status);

    const n = Math.ceil(
      Math.abs(to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (n > 0) {
      const ownerUah =
        (initialBooking.ownerPayout ?? 0) * BOOKING_AMOUNT_UAH_FACTOR;
      const profitUah =
        (initialBooking.ourProfit ?? 0) * BOOKING_AMOUNT_UAH_FACTOR;
      setOwnerPricePerNight(roundMoney2(ownerUah / n));
      setMarkupPerNight(roundMoney2(profitUah / n));
    } else {
      setOwnerPricePerNight(0);
      setMarkupPerNight(0);
    }
    setPaidAmount(0);
    setPrepaidTo("me");
  }, [initialBooking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      apartmentId: selectedApartment?.id,
      dateFrom,
      dateTo,
      guestName,
      guestPhone,
      guestCount,
      guestContact,
      // У БД — ті ж суми в гривнях, поділені на BOOKING_AMOUNT_UAH_FACTOR
      totalAmount: clientTotal / BOOKING_AMOUNT_UAH_FACTOR,
      ownerPayout: ownerTotalPrice / BOOKING_AMOUNT_UAH_FACTOR,
      ourProfit: ourProfit / BOOKING_AMOUNT_UAH_FACTOR,
      // Або використовуй нові поля
      totalAmountUAH: clientTotal,
      ownerPayoutUAH: ownerTotalPrice,
      ourProfitUAH: ourProfit,
      prepaidUAH: paidAmount,
      prepaidTo,
      ownerPhone,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ApartmentSelector
        selectedApartment={selectedApartment}
        onSelect={setSelectedApartment}
      />

      <DateSelector
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        nights={nights}
      />

      <GuestInfo
        guestName={guestName}
        guestPhone={guestPhone}
        guestCount={guestCount}
        guestContact={guestContact}
        onGuestNameChange={setGuestName}
        onGuestPhoneChange={setGuestPhone}
        onGuestCountChange={setGuestCount}
        onGuestContactChange={setGuestContact}
      />

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClipboardList size={20} className="text-blue-600" />
          Статус бронювання
        </h2>
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "PENDING" | "CONFIRMED" | "CANCELLED")
          }
          className="w-full max-w-md p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="PENDING">Очікує</option>
          <option value="CONFIRMED">Підтверджено</option>
          <option value="CANCELLED">Скасовано</option>
        </select>
      </div>

      <FinancialSection
        selectedApartment={selectedApartment}
        nights={nights}
        ownerPricePerNight={ownerPricePerNight}
        markupPerNight={markupPerNight}
        paidAmount={paidAmount}
        prepaidTo={prepaidTo}
        onOwnerPriceChange={setOwnerPricePerNight}
        onMarkupChange={setMarkupPerNight}
        onPaidAmountChange={setPaidAmount}
        onPrepaidToChange={setPrepaidTo}
        ownerTotalPrice={ownerTotalPrice}
        clientTotal={clientTotal}
        ourProfit={ourProfit}
        remainingToPay={remainingToPay}
      />

      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
