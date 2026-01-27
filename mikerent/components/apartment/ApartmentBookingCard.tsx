import { apartments } from "@/data/ApartmentsData";

type Props = {
  id: string;
};

export const ApartmentBookingCard = ({ id }: Props) => {
  const current = apartments.find((el) => el.id === id);

  return (
    <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-lg">
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold">
            {current?.pricePerNight} ₴
          </span>
          <span className="text-sm text-gray-500"> / ніч</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span className="text-yellow-500">★</span>
          <span className="font-medium text-gray-900">4.8</span>
          <span>·</span>
          <span className="underline cursor-pointer">23 відгуки</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-2">
          <div className="p-3 border-b border-r border-gray-200">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">ЗАЇЗД</p>
            <p className="text-sm text-gray-900 font-medium">—</p>
          </div>
          <div className="p-3 border-b border-gray-200">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">ВИЇЗД</p>
            <p className="text-sm text-gray-900 font-medium">—</p>
          </div>
          <div className="p-3 col-span-2">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">ГОСТІ</p>
            <p className="text-sm text-gray-900 font-medium">1 гість</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="
          mt-4 w-full h-12 rounded-xl
          bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold
          hover:from-blue-700 hover:to-blue-800 active:scale-95
          transition-all duration-200 shadow-md hover:shadow-lg
        "
      >
        Забронювати
      </button>

      <div className="mt-6 space-y-3 text-sm text-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-600">{current?.pricePerNight} ₴ × 3 ночі</span>
          <span className="font-medium">3600 ₴</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Сервісний збір</span>
          <span className="font-medium">0 ₴</span>
        </div>
        <div className="pt-3 border-t border-gray-200 flex justify-between font-semibold text-base">
          <span>Разом</span>
          <span>3600 ₴</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Поки що з вас нічого не списується.
      </p>
    </div>
  );
};