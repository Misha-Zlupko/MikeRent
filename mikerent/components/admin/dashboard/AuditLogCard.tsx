type LogRow = {
  id: string;
  adminEmail: string;
  entityType: string;
  summary: string;
  createdAt: Date;
};

export default function AuditLogCard({ logs }: { logs: LogRow[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Лог змін</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">Поки немає записів.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
          {logs.map((log) => (
            <li
              key={log.id}
              className="rounded border border-gray-100 px-3 py-2"
            >
              <span className="text-xs text-gray-500">
                {log.createdAt.toLocaleString("uk-UA")} • {log.adminEmail} •{" "}
                {log.entityType}
              </span>
              <p className="text-gray-800">{log.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
