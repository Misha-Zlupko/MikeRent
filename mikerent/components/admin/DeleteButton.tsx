"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  /** Назва квартири — для чіткого підтвердження видалення */
  title?: string;
};

export default function DeleteButton({ id, title }: Props) {
  const router = useRouter();

  const handleDelete = async () => {
    const label = title ? `«${title}»` : "цю квартиру";
    const confirmed = window.confirm(
      `Увага: видалення ${label} безповоротно знищить:\n` +
        `• квартиру та всі фото;\n` +
        `• усі бронювання цієї квартири;\n` +
        `• усі заявки на бронювання.\n\n` +
        `Перед видаленням збережіть резервну копію (кнопка на дашборді).\n\n` +
        `Продовжити видалення?`,
    );
    if (!confirmed) return;

    const typed = window.prompt(
      'Щоб підтвердити, введіть слово ВИДАЛИТИ (великими літерами):',
    );
    if (typed !== "ВИДАЛИТИ") {
      if (typed !== null) {
        alert("Видалення скасовано — текст підтвердження не збігається.");
      }
      return;
    }

    const res = await fetch(`/api/admin/apartments/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    } else {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      alert(err.error || "Помилка видалення");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleDelete()}
      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
      title="Видалити (потрібне підтвердження)"
    >
      <Trash2 size={18} />
    </button>
  );
}
