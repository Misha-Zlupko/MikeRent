// components/calendar/SeasonDatePicker.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  X,
  Check,
  AlertCircle,
  Calendar as CalendarIcon
} from "lucide-react";

interface SeasonDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  bookedDates: { from: string; to: string }[];
  onDatesSelected: (checkIn: string, checkOut: string) => void;
  currentCheckIn?: string;
  currentCheckOut?: string;
}

export const SeasonDatePicker = ({
  isOpen,
  onClose,
  bookedDates,
  onDatesSelected,
  currentCheckIn,
  currentCheckOut
}: SeasonDatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState<number>(5); // Июнь = 5 (0-январь)
  const [selectedDates, setSelectedDates] = useState<{checkIn: string | null; checkOut: string | null}>({
    checkIn: currentCheckIn || null,
    checkOut: currentCheckOut || null
  });
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isOpen]);
  
  const SEASON_YEAR = 2026;
  const SEASON_MONTHS = [5, 6, 7, 8]; // Июнь, Июль, Август, Сентябрь (0-indexed)
  
  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];
  
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const formatLocalDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  
  // Дата недоступна для нового ЗАЇЗДУ
  const isDateBooked = (date: Date): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return bookedDates.some(booking => {
      const start = new Date(booking.from);
      const end = new Date(booking.to);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      // Напіввідкритий інтервал [start, end):
      // день виїзду НЕ блокуємо для нового заїзду.
      return checkDate >= start && checkDate < end;
    });
  };

  // Для візуального червоного фону фарбуємо тільки "повні" зайняті дні
  // (без дня заїзду і дня виїзду)
  const isDateFullyBookedVisual = (date: Date): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return bookedDates.some((booking) => {
      const start = new Date(booking.from);
      const end = new Date(booking.to);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      return checkDate > start && checkDate < end;
    });
  };
  
  // Проверка, является ли дата в прошлом
  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return checkDate < today && checkDate.getFullYear() <= today.getFullYear();
  };
  
  // Проверка, доступна ли дата
  const isDateAvailable = (date: Date): boolean => {
    // Только июнь-сентябрь 2026
    const year = date.getFullYear();
    const month = date.getMonth();
    
    if (year !== SEASON_YEAR) return false;
    if (!SEASON_MONTHS.includes(month)) return false;
    
    return !isDateBooked(date) && !isDateInPast(date);
  };

  const hasOverlapWithBooked = (start: Date, end: Date): boolean => {
    return bookedDates.some((booking) => {
      const bookedStart = new Date(booking.from);
      const bookedEnd = new Date(booking.to);
      bookedStart.setHours(0, 0, 0, 0);
      bookedEnd.setHours(0, 0, 0, 0);

      // Перетин напіввідкритих інтервалів [start, end) та [bookedStart, bookedEnd)
      return start < bookedEnd && end > bookedStart;
    });
  };

  const canSelectDate = (date: Date): boolean => {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (year !== SEASON_YEAR) return false;
    if (!SEASON_MONTHS.includes(month)) return false;
    if (isDateInPast(date)) return false;

    // Якщо ще не обрано заїзд — це вибір дати заїзду, тут дата має бути вільною.
    if (!selectedDates.checkIn || selectedDates.checkOut) {
      return !isDateBooked(date);
    }

    // Якщо обираємо виїзд:
    // - дата виїзду має бути пізніше заїзду;
    // - допускаємо виїзд у день початку чужої броні.
    const checkInDate = new Date(selectedDates.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);

    if (candidate <= checkInDate) return true;

    return !hasOverlapWithBooked(checkInDate, candidate);
  };

  const getMaxNightsInWindow = (anchorDate: Date): number => {
    const dayMs = 1000 * 60 * 60 * 24;
    let left = new Date(anchorDate);
    let right = new Date(anchorDate);

    while (true) {
      const prev = new Date(left.getTime() - dayMs);
      if (!isDateAvailable(prev)) break;
      left = prev;
    }

    while (true) {
      const next = new Date(right.getTime() + dayMs);
      if (!isDateAvailable(next)) break;
      right = next;
    }

    const daysInWindow =
      Math.floor((right.getTime() - left.getTime()) / dayMs) + 1;
    return Math.max(0, daysInWindow - 1);
  };
  
  // Обработка клика по дате
  const handleDateClick = (date: Date) => {
    if (!canSelectDate(date)) return;
    setValidationError("");
    
    const dateString = formatLocalDate(date);
    
    // Если ничего не выбрано или выбираем новую начальную дату
    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      setSelectedDates({ checkIn: dateString, checkOut: null });
    } 
    // Если есть начальная дата, выбираем конечную
    else if (selectedDates.checkIn && !selectedDates.checkOut) {
      const checkInDate = new Date(selectedDates.checkIn);
      
      // Проверяем, что конечная дата позже начальной
      if (date > checkInDate) {
        setSelectedDates(prev => ({ ...prev, checkOut: dateString }));
      } else {
        // Если кликнули на дату раньше начальной, делаем её новой начальной
        setSelectedDates({ checkIn: dateString, checkOut: null });
      }
    }
  };
  
  // Генерация дней месяца
  const generateDays = (month: number) => {
    const year = SEASON_YEAR;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startingDay = firstDay.getDay();
    const days = [];
    
    // Преобразуем воскресенье (0) в 7 для правильного отступа
    const startOffset = startingDay === 0 ? 6 : startingDay - 1;
    
    // Пустые дни в начале месяца
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }
    
    return days;
  };
  
  // Проверка, выбрана ли дата
  const isDateSelected = (date: Date): boolean => {
    const dateString = formatLocalDate(date);
    return dateString === selectedDates.checkIn || dateString === selectedDates.checkOut;
  };
  
  // Проверка, находится ли дата между выбранными
  const isDateBetween = (date: Date): boolean => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    
    const dateString = formatLocalDate(date);
    const checkInDate = new Date(selectedDates.checkIn);
    const checkOutDate = new Date(selectedDates.checkOut);
    const currentDate = new Date(dateString);
    
    return currentDate > checkInDate && currentDate < checkOutDate;
  };
  
  // Навигация по месяцам
  const nextMonth = () => {
    if (currentMonth < 8) { // Максимум сентябрь (8)
      setCurrentMonth(prev => prev + 1);
    }
  };
  
  const prevMonth = () => {
    if (currentMonth > 5) { // Минимум июнь (5)
      setCurrentMonth(prev => prev - 1);
    }
  };
  
  // Применение выбора
  const handleApply = () => {
    if (selectedDates.checkIn && selectedDates.checkOut) {
      const nights = Math.ceil(
        (new Date(selectedDates.checkOut).getTime() -
          new Date(selectedDates.checkIn).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const maxNightsInWindow = getMaxNightsInWindow(
        new Date(selectedDates.checkIn),
      );
      const canUseShortWindow = maxNightsInWindow < 3;

      if (nights < 3 && !canUseShortWindow) {
        setValidationError(
          "Мінімальне бронювання — 3 ночі. Менше можна тільки якщо між бронями утворилось вікно менше 3 ночей.",
        );
        return;
      }

      onDatesSelected(selectedDates.checkIn, selectedDates.checkOut);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const days = generateDays(currentMonth);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden">
      <div className="w-full max-w-md mx-auto my-0 min-h-full flex items-center justify-center py-[max(1rem,env(safe-area-inset-top))] sm:py-8 px-3 sm:px-4">
      <div className="relative w-full rounded-2xl bg-white shadow-2xl max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Календар бронювань</h2>
              <p className="text-sm text-gray-500">Сезон 2026 • Червень - Вересень</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Навигация по месяцам */}
        <div className="flex items-center justify-between px-6 pt-4">
          <button
            onClick={prevMonth}
            disabled={currentMonth <= 5}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-bold text-gray-900">
            {monthNames[currentMonth]} {SEASON_YEAR}
          </h3>
          
          <button
            onClick={nextMonth}
            disabled={currentMonth >= 8}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 px-6 pt-4">
          {dayNames.map(day => (
            <div key={day} className="text-center py-2">
              <span className="text-xs font-semibold text-gray-500">{day}</span>
            </div>
          ))}
        </div>

        {/* Дни месяца */}
        <div className="grid grid-cols-7 gap-1 px-6 pb-6">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-10" />;
            }
            
            const isAvailable = canSelectDate(date);
            const isBooked = isDateFullyBookedVisual(date);
            const isSelected = isDateSelected(date);
            const isBetween = isDateBetween(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            let className = "h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all relative ";
            
            if (isSelected) {
              className += "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg z-10 ";
            } else if (isBetween) {
              className += "bg-blue-100 text-blue-900 ";
            } else if (!isAvailable) {
              if (isBooked) {
                className += "bg-red-50 text-red-400 cursor-not-allowed ";
              } else {
                className += "bg-gray-100 text-gray-400 cursor-not-allowed ";
              }
            } else {
              className += "hover:bg-gray-100 text-gray-900 cursor-pointer ";
            }
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                disabled={!isAvailable}
                className={className}
                onMouseEnter={() => {
                  if (isAvailable && selectedDates.checkIn && !selectedDates.checkOut) {
                    setHoveredDate(formatLocalDate(date));
                  }
                }}
              >
                {date.getDate()}
                {isSelected && (
                  <Check className="absolute top-1 right-1 w-3 h-3 text-white" />
                )}
                {isBooked && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
                )}
                {isToday && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Легенда */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-600 to-blue-700" />
              <span className="text-gray-600">Вибрана дата</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-100" />
              <span className="text-gray-600">Проміжок</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-50" />
              <span className="text-gray-600">Заброньовано</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <span className="text-gray-600">Недоступно</span>
            </div>
          </div>
        </div>

        {/* Статус выбора */}
        <div className="border-t border-gray-200 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {validationError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {validationError}
            </div>
          )}
          {selectedDates.checkIn && selectedDates.checkOut ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Період обрано!</p>
                    <p className="text-lg font-semibold text-green-900">
                      {new Date(selectedDates.checkIn).toLocaleDateString('uk-UA')} - {new Date(selectedDates.checkOut).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-800">Кількість ночей:</p>
                    <p className="text-xl font-bold text-green-900">
                      {Math.ceil((new Date(selectedDates.checkOut).getTime() - new Date(selectedDates.checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDates({ checkIn: null, checkOut: null })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Очистити
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700"
                >
                  Застосувати
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Інструкція:</p>
                    <p className="text-sm text-blue-600">
                      1. Оберіть дату заїзду<br />
                      2. Оберіть дату виїзду<br />
                      3. Червоним позначені заброньовані дати<br />
                      4. Заїзд з 14:00, виїзд до 12:00
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleApply}
                  disabled={!selectedDates.checkIn || !selectedDates.checkOut}
                  className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 disabled:opacity-50"
                >
                  Застосувати
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};