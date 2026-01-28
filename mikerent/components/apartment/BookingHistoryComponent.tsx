"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface BookingHistoryItem {
  bookingId: string;
  apartmentTitle: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export const BookingHistory = () => {
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem("apartmentBookings") || "[]");
    setBookings(storedBookings);
  }, []);

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Історія бронювань поки порожня</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Очікує підтвердження";
      case "confirmed":
        return "Підтверджено";
      case "cancelled":
        return "Скасовано";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Історія бронювань</h3>
      {bookings.map((booking) => (
        <div key={booking.bookingId} className="rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">{booking.apartmentTitle}</h4>
              <p className="text-sm text-gray-500">ID: {booking.bookingId}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(booking.status)}
              <span className="text-sm">{getStatusText(booking.status)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{booking.checkIn} - {booking.checkOut}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{booking.guests} гостей</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-gray-500">Загальна сума:</span>
            <span className="font-semibold">{booking.totalPrice} ₴</span>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Створено: {new Date(booking.createdAt).toLocaleString('uk-UA')}
          </div>
        </div>
      ))}
    </div>
  );
};