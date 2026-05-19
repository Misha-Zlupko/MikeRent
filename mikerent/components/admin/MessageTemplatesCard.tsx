"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Copy, Check } from "lucide-react";
import { fillTemplate } from "@/lib/admin/messageTemplates";

type Template = {
  slug: string;
  title: string;
  body: string;
};

type Props = {
  vars?: Record<string, string | number | undefined | null>;
};

export default function MessageTemplatesCard({ vars = {} }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);

  useEffect(() => {
    fetch("/api/admin/message-templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {});
  }, []);

  const copyText = async (slug: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveTemplate = async () => {
    if (!editing) return;
    const res = await fetch("/api/admin/message-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const updated = await res.json();
      setTemplates((prev) =>
        prev.map((t) => (t.slug === updated.slug ? updated : t)),
      );
      setEditing(null);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <MessageSquare size={20} className="text-blue-600" />
        Шаблони SMS / Telegram
      </h2>
      <p className="mb-3 text-xs text-gray-500">
        Плейсхолдери: {"{{guestName}}"}, {"{{apartmentTitle}}"}, {"{{dateFrom}}"},{" "}
        {"{{dateTo}}"}, {"{{total}}"}, {"{{remaining}}"}, {"{{address}}"}
      </p>
      <ul className="space-y-3">
        {templates.map((t) => {
          const filled = fillTemplate(t.body, vars);
          const isEdit = editing?.slug === t.slug;
          return (
            <li key={t.slug} className="rounded border border-gray-100 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{t.title}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(isEdit ? null : { ...t })}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {isEdit ? "Скасувати" : "Редагувати"}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(t.slug, filled)}
                    className="inline-flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900"
                  >
                    {copied === t.slug ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                    Копіювати
                  </button>
                </div>
              </div>
              {isEdit ? (
                <>
                  <input
                    className="mb-2 w-full rounded border p-2 text-sm"
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                  />
                  <textarea
                    className="mb-2 w-full rounded border p-2 text-sm"
                    rows={4}
                    value={editing.body}
                    onChange={(e) =>
                      setEditing({ ...editing, body: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={saveTemplate}
                    className="rounded bg-blue-600 px-3 py-1 text-xs text-white"
                  >
                    Зберегти шаблон
                  </button>
                </>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-gray-700">{filled}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
