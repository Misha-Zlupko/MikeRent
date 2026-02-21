"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Home,
  User,
  Phone,
  DollarSign,
  MessageCircle,
  Users,
} from "lucide-react";

type Apartment = {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
};

export default function NewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(
    null,
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestContact, setGuestContact] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  // Стан для передоплати
  const [prepaidTo, setPrepaidTo] = useState<"me" | "owner">("me");

  // Фінансові показники в гривнях
  const [ownerPricePerNight, setOwnerPricePerNight] = useState(0); // грн/ніч
  const [markupPerNight, setMarkupPerNight] = useState(0); // грн/ніч (мій прибуток)
  const [paidAmount, setPaidAmount] = useState(0); // грн (передоплата)

  // Завантажуємо список квартир
  useEffect(() => {
    fetch("/api/admin/apartments")
      .then((res) => res.json())
      .then((data) => setApartments(data));
  }, []);

  // Розрахунок кількості ночей
  const nights =
    dateFrom && dateTo
      ? Math.ceil(
          Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  // Фінансові розрахунки в гривнях
  const ownerTotalPrice = ownerPricePerNight * nights;
  const clientTotal = (ownerPricePerNight + markupPerNight) * nights;
  const ourProfit = markupPerNight * nights;
  const remainingToPay = clientTotal - paidAmount;

  // При виборі квартири встановлюємо початкову ціну
  useEffect(() => {
    if (selectedApartment && nights > 0 && ownerPricePerNight === 0) {
      const basePrice = selectedApartment.pricePerNight * 42;
      setOwnerPricePerNight(basePrice);
      setMarkupPerNight(Math.round(basePrice * 0.2));
    }
  }, [selectedApartment, nights, ownerPricePerNight]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const data = {
      apartmentId: selectedApartment?.id,
      dateFrom,
      dateTo,
      guestName,
      guestPhone,
      guestCount,
      guestContact,
      totalAmount: clientTotal,
      ownerPayout: ownerTotalPrice,
      ourProfit,
      prepaidUAH: paidAmount,
      prepaidTo,
      ownerPhone,
      status: "CONFIRMED",
    };

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/admin/bookings");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Помилка створення");
      }
    } catch (error) {
      alert("Помилка сервера");
    } finally {
      setLoading(false);
    }
  }

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
              <h1 className="text-xl font-bold">Нове бронювання</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Вибір квартири */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Home size={20} className="text-blue-600" />
              Квартира
            </h2>

            <select
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              value={selectedApartment?.id || ""}
              onChange={(e) => {
                const apt = apartments.find((a) => a.id === e.target.value);
                setSelectedApartment(apt || null);
                // Скидаємо ціни при зміні квартири
                setOwnerPricePerNight(0);
                setMarkupPerNight(0);
              }}
              required
            >
              <option value="">Виберіть квартиру</option>
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {apt.title} ({apt.city}) -{" "}
                  {(apt.pricePerNight * 42).toFixed(0)} грн/ніч
                </option>
              ))}
            </select>
          </div>

          {/* Дати бронювання */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Дати
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Заїзд *
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Виїзд *
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {nights > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {nights} {nights === 1 ? "ніч" : nights < 5 ? "ночі" : "ночей"}
              </p>
            )}
          </div>

          {/* Інформація про гостя */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Інформація про гостя
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Ім'я *</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Олександр Петренко"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="+380 00 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Кількість людей *
                </label>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                  <MessageCircle size={16} />
                  Контакт (Telegram/Viber)
                </label>
                <input
                  type="text"
                  value={guestContact}
                  onChange={(e) => setGuestContact(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="@username або номер"
                />
              </div>
            </div>
          </div>

          {/* Фінанси */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-blue-600" />
              Фінанси (грн)
            </h2>

            {/* Інформація про ціни */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">
                  Ціна хазяїна за сутку
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {ownerPricePerNight.toFixed(0)} грн
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 mb-1">
                  Моя націнка за сутку
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {markupPerNight.toFixed(0)} грн
                </p>
              </div>
            </div>

            {/* Поля для введення цін */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ціна хазяїна за сутку (грн)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={ownerPricePerNight}
                  onChange={(e) =>
                    setOwnerPricePerNight(Number(e.target.value))
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Моя націнка за сутку (грн)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={markupPerNight}
                  onChange={(e) => setMarkupPerNight(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Детальний розрахунок */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">
                  Хазяїну за {nights} ночей:
                </span>
                <span className="font-semibold">
                  {ownerTotalPrice.toFixed(0)} грн
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">
                  Моя націнка за {nights} ночей:
                </span>
                <span className="font-semibold text-green-600">
                  {(markupPerNight * nights).toFixed(0)} грн
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg">
                <span className="font-medium text-blue-800">
                  ЗАГАЛЬНА СУМА ДО СПЛАТИ:
                </span>
                <span className="text-2xl font-bold text-blue-800">
                  {clientTotal.toFixed(0)} грн
                </span>
              </div>
            </div>

            {/* Передоплата */}
            {/* Передоплата */}
            <div className="border-t pt-6">
              <h3 className="font-medium text-lg mb-4">Оплата від клієнта</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Передоплату отримує:
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setPrepaidTo("me")}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      prepaidTo === "me"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <User size={20} />
                      <span className="font-medium">Я</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrepaidTo("owner")}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      prepaidTo === "owner"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Home size={20} />
                      <span className="font-medium">Хазяїн</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Інформація про те, як змінюються суми */}
              {paidAmount > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 mb-2">
                    Розподіл передоплати:
                  </p>
                  {prepaidTo === "me" ? (
                    <p className="text-blue-600">
                      💰 {paidAmount.toFixed(0)} грн залишаються у вас. Хазяїн
                      отримає {ownerTotalPrice.toFixed(0)} грн при заїзді.
                    </p>
                  ) : (
                    <p className="text-blue-600">
                      💰 {paidAmount.toFixed(0)} грн йдуть хазяїну. Ви отримаєте{" "}
                      {(markupPerNight * nights).toFixed(0)} грн при заїзді.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Вже сплачено (грн)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Залишок до сплати (грн)
                  </label>
                  <div className="w-full p-2 bg-gray-100 border rounded text-gray-900 font-medium">
                    {remainingToPay.toFixed(0)} грн
                  </div>
                </div>
              </div>
            </div>
            {/* Підсумок */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Всього до сплати:</p>
                  <p className="text-lg font-bold">
                    {clientTotal.toFixed(0)} грн
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Вже сплачено:</p>
                  <p className="text-lg font-bold text-green-600">
                    {paidAmount.toFixed(0)} грн
                  </p>
                  <p className="text-xs text-gray-500">
                    ({prepaidTo === "me" ? "Мені" : "Хазяїну"})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Хазяїн отримає:</p>
                  <p className="text-lg font-bold">
                    {prepaidTo === "me"
                      ? ownerTotalPrice.toFixed(0)
                      : Math.max(0, ownerTotalPrice - paidAmount).toFixed(
                          0,
                        )}{" "}
                    грн
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Я отримаю:</p>
                  <p className="text-lg font-bold text-green-600">
                    {prepaidTo === "owner"
                      ? (markupPerNight * nights).toFixed(0)
                      : Math.max(
                          0,
                          markupPerNight * nights - paidAmount,
                        ).toFixed(0)}{" "}
                    грн
                  </p>
                </div>
              </div>
              <div className="h-px bg-gray-300 my-3" />
              <div className="flex justify-between items-center text-orange-600 font-bold">
                <span>ЗАЛИШОК ДО СПЛАТИ:</span>
                <span className="text-xl">{remainingToPay.toFixed(0)} грн</span>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Збереження..." : "Створити бронювання"}
            </button>

            <Link
              href="/admin/bookings"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Скасувати
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
