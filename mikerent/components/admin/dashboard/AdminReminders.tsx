import Link from "next/link";
import { Bell, Phone, Wallet, LogIn } from "lucide-react";
import type { AdminReminder } from "@/lib/admin/reminders";

const ICONS = {
  checkin_tomorrow: LogIn,
  owner_call: Phone,
  unpaid_balance: Wallet,
} as const;

export default function AdminReminders({ items }: { items: AdminReminder[] }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-900">
        <Bell size={20} />
        Нагадування
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-amber-800">На сьогодні все зроблено.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => {
            const Icon = ICONS[item.kind];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-start gap-3 rounded-lg border border-amber-100 bg-white px-3 py-2 text-sm hover:border-amber-300"
                >
                  <Icon size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <span>
                    <span className="font-medium text-gray-900">{item.title}</span>
                    <span className="block text-gray-600">{item.subtitle}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
