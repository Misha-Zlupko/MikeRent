// components/apartment/ApartmentBookingCard.tsx
"use client";

import { useState } from "react";
import { apartments } from "@/data/ApartmentsData";
import { BookingPopup } from "./BookingPopup";
import { SeasonDatePicker } from "../calendar/SeasonDatePickerComponent";
import { 
  Calendar, 
  AlertCircle, 
  Users, 
  DollarSign,
  ArrowRight,
  CheckCircle
} from "lucide-react";

type Props = {
  id: string;
};

export const ApartmentBookingCard = ({ id }: Props) => {
  const current = apartments.find((el) => el.id === id);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateError, setDateError] = useState("");
  
  // Состояния для формы бронирования
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);

  if (!current) {
    return null;
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut) {
      return current.pricePerNight * 3;
    }
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return current.pricePerNight * (nights > 0 ? nights : 3);
  };

  const handleDatesSelected = (newCheckIn: string, newCheckOut: string) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    setDateError("");
  };

  const validateDates = () => {
    if (!checkIn || !checkOut) {
      setDateError("Будь ласка, оберіть дати заїзду та виїзду");
      return false;
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    
    // Проверяем, что дата выезда позже даты заезда
    if (endDate <= startDate) {
      setDateError("Дата виїзду повинна бути пізніше дати заїзду");
      return false;
    }
    
    // Проверяем, что дата заезда не в прошлом
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      setDateError("Не можна забронювати квартиру на минулу дату");
      return false;
    }
    
    // Проверяем сезонность (июнь-сентябрь 2026)
    const seasonStart = new Date("2026-06-01");
    const seasonEnd = new Date("2026-09-30");
    
    if (startDate < seasonStart || endDate > seasonEnd) {
      setDateError(`Бронювання доступне тільки з 1 червня по 30 вересня 2026 року`);
      return false;
    }
    
    // Проверяем забронированные даты
    for (const booking of current.availability.booked) {
      const bookedStart = new Date(booking.from);
      const bookedEnd = new Date(booking.to);
      
      // Проверяем пересечение интервалов
      if (
        (startDate >= bookedStart && startDate <= bookedEnd) ||
        (endDate >= bookedStart && endDate <= bookedEnd) ||
        (startDate <= bookedStart && endDate >= bookedEnd)
      ) {
        setDateError(`Цей період частково або повністю заброньований (${bookedStart.toLocaleDateString('uk-UA')} - ${bookedEnd.toLocaleDateString('uk-UA')})`);
        return false;
      }
    }
    
    return true;
  };

  const handleBookingClick = () => {
    if (validateDates()) {
      setIsBookingOpen(true);
    }
  };

  const totalPrice = calculateTotal();
  const nights = !checkIn || !checkOut ? 3 : 
    Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));

  // Форматирование даты для отображения
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-2xl font-bold">
              {current.pricePerNight} ₴
            </span>
            <span className="text-sm text-gray-500"> / ніч</span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="text-yellow-500">★</span>
            <span className="font-medium text-gray-900">{current.rating}</span>
            <span>·</span>
            <span className="underline cursor-pointer">{current.reviewsCount} відгуків</span>
          </div>
        </div>

        {/* Выбор дат через календарь */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Дати перебування</span>
            </div>
            <span className="text-xs text-blue-600 font-medium">Сезон 2026</span>
          </div>
          
          <div 
            onClick={() => setIsDatePickerOpen(true)}
            className="
              relative
              border-2 border-dashed border-gray-300 
              rounded-xl 
              p-4
              hover:border-blue-400 
              hover:bg-blue-50 
              cursor-pointer 
              transition-all 
              duration-300
              group
            "
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Заезд */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заїзд
                  </span>
                </div>
                {checkIn ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(checkIn).getDate()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(checkIn).toLocaleDateString('uk-UA', { 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-gray-400">Оберіть дату</p>
                )}
              </div>
              
              {/* Стрелка */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              
              {/* Выезд */}
              <div className="space-y-2 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Виїзд
                  </span>
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                </div>
                {checkOut ? (
                  <>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(checkOut).getDate()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(checkOut).toLocaleDateString('uk-UA', { 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-gray-400">Оберіть дату</p>
                )}
              </div>
            </div>
            
            {/* Количество ночей */}
            {checkIn && checkOut && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {nights} {nights === 1 ? "ніч" : nights < 5 ? "ночі" : "ночей"}
                  </span>
                </div>
              </div>
            )}
            
            {/* Подсказка */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Натисніть для вибору
              </span>
            </div>
          </div>
          
          {/* Мини-информация о сезоне */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Червень - Вересень 2026</span>
            <span>{current.availability.booked.length} заброньованих періодів</span>
          </div>
        </div>

        {/* Выбор гостей */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Гості</span>
            </div>
            <span className="text-xs text-gray-500">Максимум: {current.guests}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900">{guestCount} {guestCount === 1 ? "гість" : guestCount < 5 ? "гості" : "гостей"}</p>
              <p className="text-sm text-gray-500">Виберіть кількість</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                disabled={guestCount <= 1}
                className="
                  w-10 h-10 
                  rounded-full 
                  border-2 
                  border-gray-300 
                  flex 
                  items-center 
                  justify-center 
                  text-gray-700
                  font-bold
                  hover:border-blue-500 
                  hover:text-blue-600
                  hover:bg-blue-50
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition-all
                  duration-200
                  active:scale-95
                "
              >
                −
              </button>
              
              <span className="w-12 text-center text-2xl font-bold text-gray-900">
                {guestCount}
              </span>
              
              <button
                onClick={() => setGuestCount(prev => Math.min(current.guests, prev + 1))}
                disabled={guestCount >= current.guests}
                className="
                  w-10 h-10 
                  rounded-full 
                  border-2 
                  border-gray-300 
                  flex 
                  items-center 
                  justify-center 
                  text-gray-700
                  font-bold
                  hover:border-blue-500 
                  hover:text-blue-600
                  hover:bg-blue-50
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition-all
                  duration-200
                  active:scale-95
                "
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Сообщение об ошибке */}
        {dateError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{dateError}</p>
          </div>
        )}

        {/* Стоимость */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-900">Розрахунок вартості</span>
          </div>
          
          <div className="space-y-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600">
                  {current.pricePerNight} ₴ × {nights} {nights === 1 ? "ніч" : nights < 5 ? "ночі" : "ночей"}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {checkIn && checkOut ? (
                    <>
                      {formatDateDisplay(checkIn)} - {formatDateDisplay(checkOut)}
                    </>
                  ) : "Оберіть дати для точного розрахунку"}
                </p>
              </div>
              <span className="font-medium text-lg">{current.pricePerNight * nights} ₴</span>
            </div>
            
            <div className="flex justify-between items-center text-green-600">
              <span>Знижка за тривале перебування</span>
              <span className="font-medium">−0 ₴</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Сервісний збір</span>
              <span className="font-medium">0 ₴</span>
            </div>
            
            <div className="pt-4 border-t border-gray-300 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Разом</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">{totalPrice} ₴</span>
                <p className="text-xs text-gray-500 mt-1">
                  {checkIn && checkOut ? "За весь період" : "За 3 ночі (приблизно)"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка бронирования */}
        <button
          onClick={handleBookingClick}
          disabled={!!dateError || !checkIn || !checkOut}
          className="
            w-full h-14 rounded-xl
            bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600
            text-white font-semibold text-lg
            transition-all duration-300
            hover:from-blue-700 hover:via-blue-600 hover:to-blue-700
            hover:shadow-xl hover:scale-[1.02]
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            relative overflow-hidden group
          "
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Забронювати зараз
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Безпечне бронювання</span>
            <span className="text-gray-300">•</span>
            <span>Сплата при заселенні</span>
            <span className="text-gray-300">•</span>
            <span>Без прихованих платежів</span>
          </div>
        </div>
      </div>

      {/* Модальное окно календаря */}
      {isDatePickerOpen && (
        <SeasonDatePicker
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          bookedDates={current.availability.booked}
          onDatesSelected={handleDatesSelected}
          currentCheckIn={checkIn}
          currentCheckOut={checkOut}
        />
      )}

      {/* Попап бронирования */}
      {isBookingOpen && (
        <BookingPopup
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          apartmentId={current.id}
          apartmentTitle={current.title}
          pricePerNight={current.pricePerNight}
          guests={guestCount}
          checkIn={checkIn}
          checkOut={checkOut}
          totalPrice={totalPrice}
        />
      )}
    </>
  );
};