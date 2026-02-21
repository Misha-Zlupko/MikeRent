"use client";

import { User, Phone, MessageCircle, Users } from "lucide-react";

type Props = {
  guestName: string;
  guestPhone: string;
  guestCount: number;
  guestContact: string;
  onGuestNameChange: (value: string) => void;
  onGuestPhoneChange: (value: string) => void;
  onGuestCountChange: (value: number) => void;
  onGuestContactChange: (value: string) => void;
};

export default function GuestInfo({
  guestName,
  guestPhone,
  guestCount,
  guestContact,
  onGuestNameChange,
  onGuestPhoneChange,
  onGuestCountChange,
  onGuestContactChange,
}: Props) {
  return (
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
            onChange={(e) => onGuestNameChange(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Олександр Петренко"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Телефон</label>
          <input
            type="tel"
            value={guestPhone}
            onChange={(e) => onGuestPhoneChange(e.target.value)}
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
            onChange={(e) => onGuestCountChange(Number(e.target.value))}
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
            onChange={(e) => onGuestContactChange(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="@username або номер"
          />
        </div>
      </div>
    </div>
  );
}
