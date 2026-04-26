"use client";

import { useState } from "react";
import {
  X,
  Loader2,
  CheckCircle,
  Phone,
  MessageSquare,
  Calendar,
  Users,
} from "lucide-react";

interface BookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  apartmentId: string;
  apartmentTitle: string;
  pricePerNight: number;
  guests: number;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}

export const BookingPopup = ({
  isOpen,
  onClose,
  apartmentId,
  apartmentTitle,
  pricePerNight,
  guests,
  checkIn,
  checkOut,
  totalPrice,
}: BookingPopupProps) => {
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");

  // Валидация украинского номера телефона
  const isValidUkrainianPhone = (phone: string): boolean => {
    const phoneRegex = /^(\+?38)?(0\d{9})$/;
    const cleaned = phone.replace(/\s/g, "");
    return phoneRegex.test(cleaned);
  };

  // Рассчитываем количество ночей
  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Валидация телефона
    if (!isValidUkrainianPhone(phone)) {
      setError(
        "Будь ласка, введіть коректний український номер телефону (наприклад: 0981234567 або +380981234567)",
      );
      return;
    }

    setIsLoading(true);

    try {
      const nights = calculateNights();
      const payload = {
        apartmentId,
        apartmentTitle,
        phone: phone.replace(/\s/g, ""),
        comment: comment || "",
        guests,
        nights,
        checkIn,
        checkOut,
        pricePerNight,
        totalPrice,
      };

      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Не вдалося створити заявку");
      }

      setIsSuccess(true);
      setBookingId(result.bookingNumber || "");

      // Автоматически закрываем через 8 секунд
      const closeTimer = setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setBookingId("");
        setPhone("");
        setComment("");
      }, 8000);

      // Очищаем таймер при размонтировании
      return () => clearTimeout(closeTimer);
    } catch (err: any) {
      setError(err?.message || "Щось пішло не так. Спробуйте ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const nights = calculateNights();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      {/* Добавляем контейнер с фиксированной максимальной высотой */}
      <div className="w-full max-w-md my-8">
        <div className="relative rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
          {/* Заголовок - фиксированный */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6 shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              {isSuccess
                ? "Бронювання відправлено"
                : "Заповніть дані для бронювання"}
            </h2>
            {!isLoading && !isSuccess && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                aria-label="Закрити"
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Основной контент - с прокруткой */}
          <div className="flex-1 overflow-y-auto p-6">
            {isSuccess ? (
              <div className="text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Дякуємо за бронювання! 🎉
                </h3>
                <p className="mb-4 text-gray-600">
                  Заявка успішно відправлена! З вами зв'яжеться менеджер для
                  підтвердження бронювання протягом 15 хвилин.
                </p>
                <div className="rounded-lg bg-gray-50 p-4 text-left">
                  <p className="text-sm text-gray-500">Номер заявки:</p>
                  <p className="font-mono font-semibold text-lg text-blue-600">
                    {bookingId}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Ваш номер:</p>
                  <p className="font-medium">{phone}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      ℹ️ Заявка збережена в історії вашого браузера
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  Закрити
                </button>
              </div>
            ) : (
              <>
                {/* Информация о бронировании */}
                <div className="mb-6 rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    {apartmentTitle}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-500">Період:</span>
                      <span className="font-medium">
                        {new Date(checkIn).toLocaleDateString("uk-UA")} -{" "}
                        {new Date(checkOut).toLocaleDateString("uk-UA")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-500">Гостей:</span>
                      <span className="font-medium">{guests}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Кількість ночей:</span>
                      <span className="font-medium">{nights}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-100 flex justify-between">
                      <span className="font-medium text-gray-900">
                        Загальна сума:
                      </span>
                      <span className="font-semibold text-blue-600 text-lg">
                        {totalPrice} ₴
                      </span>
                    </div>
                  </div>
                </div>

                {/* Форма */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Phone size={16} />
                      Номер телефону *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+380 98 123 45 67"
                      required
                      disabled={isLoading}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Менеджер зв'яжеться з вами за цим номером. Формат:
                      +380XXXXXXXXX
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MessageSquare size={16} />
                      Коментар (необов'язково)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Особливі побажання, час прибуття, додаткові потреби..."
                      rows={3}
                      disabled={isLoading}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                      <p className="text-sm text-red-600 font-medium mb-2">
                        Помилка відправки
                      </p>
                      <p className="text-sm text-red-700 mb-2">{error}</p>
                      <div className="text-xs text-red-600 space-y-1">
                        <p>Що робити:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Перевірте підключення до інтернету</li>
                          <li>Спробуйте оновити сторінку</li>
                          <li>
                            Якщо проблема повторюється - зателефонуйте нам
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 font-semibold text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Відправка...
                      </>
                    ) : (
                      "Відправити заявку на бронювання"
                    )}
                  </button>

                <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                    <p className="text-xs text-blue-700">
                      📱{" "}
                      <span className="font-medium">
                        Заявка буде створена в адмін-панелі
                      </span>
                      <br />⏰ Менеджер побачить її в розділі заявок
                    </p>
                  </div>

                  <p className="text-center text-xs text-gray-500">
                    Натискаючи кнопку, ви погоджуєтесь з умовами обробки
                    персональних даних
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
