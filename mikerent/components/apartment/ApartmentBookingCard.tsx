import { apartments } from "@/data/ApartmentsData";

type Props = {
  id: string;
};

export const ApartmentBookingCard = ({ id }: Props) => {
  const current = apartments.find((el) => el.id === id);

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold">
              {current?.pricePerNight} ₴
            </span>
            <span className="text-sm text-gray-500"> / ніч</span>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">4.8</span> · 23
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-2">
            <div className="p-3 border-b border-r border-gray-200">
              <p className="text-[10px] font-semibold text-gray-500">ЗАЇЗД</p>
              <p className="text-sm text-gray-900">—</p>
            </div>
            <div className="p-3 border-b border-gray-200">
              <p className="text-[10px] font-semibold text-gray-500">ВИЇЗД</p>
              <p className="text-sm text-gray-900">—</p>
            </div>
            <div className="p-3 col-span-2">
              <p className="text-[10px] font-semibold text-gray-500">ГОСТІ</p>
              <p className="text-sm text-gray-900">1 гість</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="
                mt-4 w-full h-12 rounded-xl
                bg-main text-white font-semibold
                transition hover:bg-main/90 active:scale-95
              "
        >
          Забронювати
        </button>

        <div className="mt-4 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>{current?.pricePerNight} ₴ × 3 ночі</span>
            <span>3600 ₴</span>
          </div>
          <div className="flex justify-between">
            <span>Сервісний збір</span>
            <span>0 ₴</span>
          </div>
          <div className="pt-2 border-t border-gray-200 flex justify-between font-semibold">
            <span>Разом</span>
            <span>3600 ₴</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Поки що з вас нічого не списується.
        </p>
      </div>
    </aside>
  );
};
