import { CalendarDays, Clock, Ban, Sparkles, Dog, Volume2, ShieldAlert } from "lucide-react";

export const ApartmentRules = () => {
  return (
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-md border border-gray-100">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <Sparkles size={18} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Правила</h2>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Заїзд */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <CalendarDays size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Заїзд</p>
            <p className="text-sm font-medium text-gray-800">після 14:00</p>
          </div>
        </div>
        
        {/* Виїзд */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <Clock size={16} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Виїзд</p>
            <p className="text-sm font-medium text-gray-800">до 11:00</p>
          </div>
        </div>
        
        {/* Заборонено */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
            <Ban size={16} />
          </div>
          <div>
            <p className="text-xs text-rose-500 font-medium">Заборонено</p>
            <p className="text-sm font-medium text-gray-800">вечірки, паління</p>
          </div>
        </div>
        
        {/* Тварини */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
            <Dog size={16} />
          </div>
          <div>
            <p className="text-xs text-green-600 font-medium">Дозволено</p>
            <p className="text-sm font-medium text-gray-800">домашні тварини</p>
          </div>
        </div>
        
        {/* Шум */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
            <Volume2 size={16} />
          </div>
          <div>
            <p className="text-xs text-purple-600 font-medium">Тихий час</p>
            <p className="text-sm font-medium text-gray-800">після 22:00 не шуміти</p>
          </div>
        </div>
        
        {/* Майно */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <ShieldAlert size={16} />
          </div>
          <div>
            <p className="text-xs text-orange-600 font-medium">Відповідальність</p>
            <p className="text-sm font-medium text-gray-800">не псувати майно</p>
          </div>
        </div>
      </div>
    </div>
  );
};