import Link from "next/link";

type Props = {
  loading: boolean;
  submitLabel?: string;
};

export default function FormActions({ loading, submitLabel }: Props) {
  const label = submitLabel ?? "Створити бронювання";
  return (
    <div className="flex gap-4">
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Збереження..." : label}
      </button>

      <Link
        href="/admin/bookings"
        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Скасувати
      </Link>
    </div>
  );
}
