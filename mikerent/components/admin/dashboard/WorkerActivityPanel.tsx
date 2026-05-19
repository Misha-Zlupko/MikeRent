import type { WorkerDayActivity } from "@/lib/admin/workerActivity";

type Props = {
  since: string;
  workers: WorkerDayActivity[];
  apartmentsCreatedToday: { id: string; title: string; createdAt: Date }[];
};

export default function WorkerActivityPanel({
  since,
  workers,
  apartmentsCreatedToday,
}: Props) {
  const dateLabel = new Date(since).toLocaleDateString("uk-UA");

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-sky-900">
        Активність співробітників — {dateLabel}
      </h2>
      <p className="mb-4 text-sm text-sky-800">
        Додані квартири, прозвони та зміни броней (з логу дій).
      </p>

      {workers.length === 0 ? (
        <p className="text-sm text-gray-600">
          Ще немає акаунтів співробітників. Створіть їх у блоці нижче.
        </p>
      ) : (
        <div className="space-y-4">
          {workers.map((w) => (
            <div
              key={w.adminEmail}
              className="rounded-lg border border-sky-100 bg-white p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-gray-900">
                  {w.name || w.adminEmail}
                </span>
                <span className="text-xs text-gray-500">{w.adminEmail}</span>
              </div>
              <div className="mb-2 flex flex-wrap gap-3 text-sm">
                <span>Квартири: {w.totals.apartments}</span>
                <span>Прозвони: {w.totals.calls}</span>
                <span>Броні: {w.totals.bookings}</span>
                <span>Всього дій: {w.totals.actions}</span>
              </div>
              {w.calls.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-600">Прозвонені:</p>
                  <ul className="text-sm text-gray-800">
                    {w.calls.map((c) => (
                      <li key={c.at + c.entityId}>• {c.summary}</li>
                    ))}
                  </ul>
                </div>
              )}
              {w.apartmentsCreated.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600">Додані квартири:</p>
                  <ul className="text-sm text-gray-800">
                    {w.apartmentsCreated.map((a) => (
                      <li key={a.entityId}>• {a.summary}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {apartmentsCreatedToday.length > 0 && (
        <div className="mt-4 border-t border-sky-100 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Усі нові квартири сьогодні ({apartmentsCreatedToday.length})
          </p>
          <ul className="max-h-32 overflow-y-auto text-sm text-gray-600">
            {apartmentsCreatedToday.map((a) => (
              <li key={a.id}>
                {a.title} —{" "}
                {new Date(a.createdAt).toLocaleTimeString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
