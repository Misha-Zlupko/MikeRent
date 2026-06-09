"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Headphones,
} from "lucide-react";
import {
  FAQ_ITEMS,
  FAQ_SECTIONS,
  type FaqCategory,
  type FaqItem,
} from "@/data/faqContent";

const SECTION_ICONS = {
  booking: CalendarDays,
  payment: CircleDollarSign,
  service: Headphones,
} as const;

export function FaqList() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const grouped = useMemo(() => {
    return FAQ_SECTIONS.map((section) => ({
      ...section,
      items: FAQ_ITEMS.filter((item) => item.category === section.id),
    })).filter((section) => section.items.length > 0);
  }, []);

  const scrollToSection = (category: FaqCategory) => {
    document
      .getElementById(`faq-section-${category}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        {FAQ_SECTIONS.map((section) => {
          const Icon = SECTION_ICONS[section.id];
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-main/30 hover:text-main hover:shadow-md active:scale-[0.98]"
            >
              <Icon className="h-4 w-4 text-main" strokeWidth={1.75} />
              {section.title}
            </button>
          );
        })}
      </div>

      {grouped.map((section) => {
        const Icon = SECTION_ICONS[section.id];

        return (
          <section
            key={section.id}
            id={`faq-section-${section.id}`}
            className="scroll-mt-24 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_4px_24px_-8px_rgba(15,23,42,0.08)]"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50/80 via-white to-white px-5 py-5 md:px-7 md:py-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-main/10 text-main">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                    {section.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {section.items.map((item) => (
                <FaqRow
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() =>
                    setOpenId((prev) => (prev === item.id ? null : item.id))
                  }
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function FaqRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="group">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className={`flex w-full items-start gap-4 px-5 py-4 text-left transition-colors md:gap-5 md:px-7 md:py-5 ${
          isOpen ? "bg-sky-50/40" : "hover:bg-slate-50/80"
        }`}
      >
        <span
          className={`mt-1 h-5 w-1 shrink-0 rounded-full transition-colors duration-300 ${
            isOpen ? "bg-main" : "bg-slate-200 group-hover:bg-slate-300"
          }`}
          aria-hidden
        />

        <span className="min-w-0 flex-1">
          <span
            className={`block text-[15px] font-semibold leading-snug transition-colors md:text-base ${
              isOpen ? "text-slate-900" : "text-slate-800"
            }`}
          >
            {item.question}
          </span>
        </span>

        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            isOpen
              ? "rotate-180 border-main/20 bg-main text-white"
              : "border-slate-200 bg-white text-slate-400 group-hover:border-slate-300"
          }`}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.25} />
        </span>
      </button>

      <div
        className={`faq-accordion-panel ${isOpen ? "faq-accordion-panel--open" : ""}`}
      >
        <div className="faq-accordion-panel__inner">
          <div className="faq-accordion-panel__content border-l-2 border-main/25 md:ml-7">
            <p className="text-sm leading-[1.75] text-slate-600 md:text-[15px]">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
