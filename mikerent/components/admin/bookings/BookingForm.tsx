"use client";

import { useState, useEffect } from "react";
import ApartmentSelector from "./ApartmentSelector";
import DateSelector from "./DateSelector";
import GuestInfo from "./GuestInfo";
import GuestHistoryPanel from "./GuestHistoryPanel";
import PaymentStatusSelect from "./PaymentStatusSelect";
import MessageTemplatesCard from "@/components/admin/MessageTemplatesCard";
import FinancialSection from "./FinancialSection";
import FormActions from "./FormActions";
import { ClipboardList } from "lucide-react";
import type { BookingRecordType, PaymentStatus } from "@prisma/client";
import { calcPrepaymentTotals } from "@/lib/bookingPrepayment";
import {
  BOOKING_AMOUNT_UAH_FACTOR,
  bookingStoredToUah,
  uahToBookingStored,
} from "@/lib/bookingAmounts";
import { bookingRangeToCalendarIso } from "@/lib/bookingCalendarDates";
import BookingRecordTypeSelect from "./BookingRecordTypeSelect";
import { isAgencyBooking } from "@/lib/bookingRecordType";

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
  prepaidToMe: number | null;
  prepaidToOwner: number | null;
  paymentStatus?: PaymentStatus;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED";
  recordType?: BookingRecordType;
};

type BookingFormProps = {
  onSubmit: (data: Record<string, unknown>) => void;
  loading: boolean;
  initialBooking?: InitialBookingValues | null;
  submitLabel?: string;
  bookingId?: string;
  /** Скасування в формі — лише власник */
  canCancelBookings?: boolean;
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
  bookingId,
  canCancelBookings = false,
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
    "PENDING" | "CONFIRMED" | "CANCELLED" | "REJECTED"
  >("CONFIRMED");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("UNPAID");
  const [guestNotes, setGuestNotes] = useState("");
  const [recordType, setRecordType] = useState<BookingRecordType>("AGENCY");

  // Фінансові показники в гривнях
  const [ownerPricePerNight, setOwnerPricePerNight] = useState(0); // грн/ніч
  const [markupPerNight, setMarkupPerNight] = useState(0); // грн/ніч (мій прибуток)
  const [prepaidToMe, setPrepaidToMe] = useState(0);
  const [prepaidToOwner, setPrepaidToOwner] = useState(0);

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
    const { from: fromIso, to: toIso } = bookingRangeToCalendarIso(from, to);
    setDateFrom(fromIso);
    setDateTo(toIso);

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
    setPrepaidToMe(
      roundMoney2(bookingStoredToUah(initialBooking.prepaidToMe) ?? 0),
    );
    setPrepaidToOwner(
      roundMoney2(bookingStoredToUah(initialBooking.prepaidToOwner) ?? 0),
    );
    setPaymentStatus(initialBooking.paymentStatus ?? "UNPAID");
    setRecordType(initialBooking.recordType ?? "AGENCY");
  }, [initialBooking]);

  const isClientBooking = isAgencyBooking(recordType);

  const { remainingToPay } = calcPrepaymentTotals({
    clientTotal,
    ownerTotalPrice,
    ourProfit,
    prepaidToMe,
    prepaidToOwner,
  });

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
      prepaidToMe: uahToBookingStored(prepaidToMe),
      prepaidToOwner: uahToBookingStored(prepaidToOwner),
      paymentStatus,
      guestNotes,
      ownerPhone,
      status,
      recordType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BookingRecordTypeSelect value={recordType} onChange={setRecordType} />

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

      {isClientBooking && (
        <>
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

          <GuestHistoryPanel
            guestPhone={guestPhone}
            guestName={guestName}
            guestNotes={guestNotes}
            onGuestNotesChange={setGuestNotes}
            excludeBookingId={bookingId}
          />

          <PaymentStatusSelect
            value={paymentStatus}
            onChange={setPaymentStatus}
          />

          <MessageTemplatesCard
            vars={{
              guestName,
              apartmentTitle: selectedApartment?.title,
              dateFrom,
              dateTo,
              total: clientTotal,
              remaining: remainingToPay,
              address: selectedApartment?.city,
            }}
          />
        </>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ClipboardList size={20} className="text-blue-600" />
          Статус бронювання
        </h2>
        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as
                | "PENDING"
                | "CONFIRMED"
                | "CANCELLED"
                | "REJECTED",
            )
          }
          className="w-full max-w-md p-2 border rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="PENDING">Очікує</option>
          <option value="CONFIRMED">Підтверджено</option>
          {canCancelBookings && (
            <>
              <option value="CANCELLED">Скасовано</option>
              <option value="REJECTED">Відхилено</option>
            </>
          )}
        </select>
        {!canCancelBookings && (
          <p className="mt-2 text-xs text-gray-500">
            Скасувати бронювання може лише власник.
          </p>
        )}
      </div>

      {isClientBooking && (
        <FinancialSection
          selectedApartment={selectedApartment}
          nights={nights}
          ownerPricePerNight={ownerPricePerNight}
          markupPerNight={markupPerNight}
          prepaidToMe={prepaidToMe}
          prepaidToOwner={prepaidToOwner}
          onOwnerPriceChange={setOwnerPricePerNight}
          onMarkupChange={setMarkupPerNight}
          onPrepaidToMeChange={setPrepaidToMe}
          onPrepaidToOwnerChange={setPrepaidToOwner}
          ownerTotalPrice={ownerTotalPrice}
          clientTotal={clientTotal}
          ourProfit={ourProfit}
        />
      )}

      <FormActions loading={loading} submitLabel={submitLabel} />
    </form>
  );
}
