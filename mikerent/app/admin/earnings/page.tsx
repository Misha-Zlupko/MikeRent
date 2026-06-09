export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { EarningsDashboard } from "@/components/admin/earnings/EarningsDashboard";
import { getEarningsOverview } from "@/lib/admin/earningsStats";
import { requireOwner } from "@/lib/adminAuth";

export default async function AdminEarningsPage() {
  const session = await requireOwner();
  if (!session) {
    redirect("/admin/dashboard");
  }

  const data = await getEarningsOverview();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b border-gray-200 bg-white">
        <div className="container flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-gray-500 transition hover:text-gray-800"
              title="Назад до дашборду"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Заробіток</h1>
                <p className="text-sm text-gray-500">
                  Фінансовий огляд по бронюваннях агентства
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/admin/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Усі бронювання →
          </Link>
        </div>
      </div>

      <main className="container py-8">
        <EarningsDashboard data={data} />
      </main>
    </div>
  );
}
