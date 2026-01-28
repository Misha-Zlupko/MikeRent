// components/calendar/SeasonDatePicker.tsx
"use client";

import { useState } from "react";
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
  
  const SEASON_YEAR = 2026;
  const SEASON_MONTHS = [5, 6, 7, 8]; // Июнь, Июль, Август, Сентябрь (0-indexed)
  
  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];
  
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  
  // Проверка, забронирована ли дата
  const isDateBooked = (date: Date): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return bookedDates.some(booking => {
      const start = new Date(booking.from);
      const end = new Date(booking.to);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return checkDate >= start && checkDate <= end;
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
  
  // Обработка клика по дате
  const handleDateClick = (date: Date) => {
    if (!isDateAvailable(date)) return;
    
    const dateString = date.toISOString().split('T')[0];
    
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
    const dateString = date.toISOString().split('T')[0];
    return dateString === selectedDates.checkIn || dateString === selectedDates.checkOut;
  };
  
  // Проверка, находится ли дата между выбранными
  const isDateBetween = (date: Date): boolean => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return false;
    
    const dateString = date.toISOString().split('T')[0];
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
      onDatesSelected(selectedDates.checkIn, selectedDates.checkOut);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const days = generateDays(currentMonth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
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
            
            const isAvailable = isDateAvailable(date);
            const isBooked = isDateBooked(date);
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
                    setHoveredDate(date.toISOString().split('T')[0]);
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
        <div className="border-t border-gray-200 p-6">
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800"
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
                      3. Червоним позначені заброньовані дати
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                >
                  Застосувати
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};