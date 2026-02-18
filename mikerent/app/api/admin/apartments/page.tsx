"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

// Це має бути серверний компонент для отримання даних
// А клієнтський компонент тільки для кнопки видалення
export default function AdminApartmentsPage({
  apartments: initialApartments,
}: any) {
  const [apartments, setApartments] = useState(initialApartments);
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Ви впевнені, що хочете видалити цю квартиру?")) return;

    try {
      const res = await fetch(`/api/admin/apartments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Видаляємо з локального стану
        setApartments(apartments.filter((apt: any) => apt.id !== id));
        router.refresh();
      } else {
        alert("Помилка при видаленні");
      }
    } catch (error) {
      alert("Помилка сервера");
    }
  }

  return (
    // ... твій JSX з таблицею

    // В кнопці видалення:
    <button
      onClick={() => handleDelete(apt.id)}
      className="inline-flex items-center gap-1 text-red-600 hover:text-red-900"
    >
      <Trash2 size={18} />
      Delete
    </button>

    // ...
  );
}
