"use client";

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";

export default function ManageWorkersCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = (await res.json()) as { error?: string; email?: string };
      if (!res.ok) {
        setError(data.error || "Помилка");
        return;
      }
      setMessage(`Акаунт створено: ${data.email}. Передайте пароль співробітнику.`);
      setEmail("");
      setPassword("");
      setName("");
    } catch {
      setError("Помилка мережі");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-6 shadow-sm">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-violet-900">
        <Users size={20} />
        Співробітник (обмежений доступ)
      </h2>
      <p className="mb-4 text-sm text-violet-800">
        Може додавати та редагувати квартири, броні, прозвони.{" "}
        <strong>Не може видаляти</strong> квартири та бронювання і не бачить
        резервні копії.
      </p>
      <form onSubmit={handleCreate} className="space-y-3">
        <input
          type="email"
          required
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Імʼя (необовʼязково)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Пароль (мін. 8 символів)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          <UserPlus size={16} />
          {loading ? "Створення…" : "Створити акаунт"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
