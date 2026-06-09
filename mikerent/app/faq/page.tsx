import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  Clock3,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FaqList } from "@/components/faq/FaqList";

export const metadata: Metadata = {
  title: "Питання та відповіді",
  description:
    "Як забронювати житло в Чорноморську: заїзд, виїзд, передоплата, підбір житла та ціни на MikeRent.",
  alternates: {
    canonical: "/faq",
  },
};

const HIGHLIGHTS = [
  {
    icon: Clock3,
    title: "14:00 / 12:00",
    text: "Стандартний заїзд і виїзд",
  },
  {
    icon: ShieldCheck,
    title: "0% комісії",
    text: "Без доплат для гостя",
  },
  {
    icon: Sparkles,
    title: "1 доба",
    text: "Типова передоплата",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-slate-100 via-blue-50/40 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="container relative py-8 md:py-14">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-main md:mb-10"
          >
            <ChevronLeft className="h-4 w-4" />
            На головну
          </Link>

          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-xs font-medium uppercase tracking-wider text-blue-700">
              Центр допомоги
            </span>
            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
              Питання та{" "}
              <span className="text-blue-600">відповіді</span>
            </h1>
            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-500">
              Коротко і по суті — про бронювання, оплату та підбір житла в
              Чорноморську
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-sm"
                >
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-main/10 text-main">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <FaqList />

          <div className="relative mt-12 overflow-hidden rounded-3xl bg-main p-6 text-white shadow-[0_20px_50px_-12px_rgba(0,161,241,0.45)] md:p-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md">
                <p className="text-lg font-bold md:text-xl">
                  Не знайшли відповідь?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">
                  Зателефонуйте — менеджер MikeRent відповість особисто і
                  допоможе з бронюванням
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:+380636619621"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-main transition hover:bg-sky-50 active:scale-[0.98]"
                >
                  <Phone className="h-4 w-4" />
                  +38 (063) 661-96-21
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
                >
                  Обрати житло
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
