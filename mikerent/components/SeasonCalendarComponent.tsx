"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SEASON } from "@/data/SeasonData";

const SEASON_YEAR = 2026;

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onComplete?: () => void;
};

export const SeasonCalendar = ({ value, onChange, onComplete }: Props) => {
  const [monthIndex, setMonthIndex] = useState(0);

  const currentMonth = SEASON.months[monthIndex];
  const maxIndex = SEASON.months.length - 1;

  const realToday = new Date();
  realToday.setHours(0, 0, 0, 0);

  const seasonStart = new Date(SEASON_YEAR, 5, 1);
  seasonStart.setHours(0, 0, 0, 0);
  const shouldDisablePastDates = realToday >= seasonStart;

  const prevMonth = () => {
    if (monthIndex > 0) setMonthIndex(monthIndex - 1);
  };

  const nextMonth = () => {
    if (monthIndex < maxIndex) setMonthIndex(monthIndex + 1);
  };

  function selectDate(date: Date) {
    if (!value.from || value.to) {
      onChange({ from: date, to: null });
      return;
    }

    if (date < value.from) {
      onChange({ from: date, to: null });
      return;
    }

    onChange({ from: value.from, to: date });
    onComplete?.();
  }

  const firstDay = new Date(SEASON_YEAR, currentMonth.month, 1).getDay();

  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  return (
    <div className="space-y-4 w-[280px]">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={monthIndex === 0}
          className="disabled:opacity-30"
        >
          <ArrowLeft />
        </button>

        <h3 className="font-semibold">
          {currentMonth.name} {SEASON_YEAR}
        </h3>

        <button
          type="button"
          onClick={nextMonth}
          disabled={monthIndex === maxIndex}
          className="disabled:opacity-30"
        >
          <ArrowRight />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-muted">
        {SEASON.weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {currentMonth.days.map((day) => {
          const date = new Date(SEASON_YEAR, currentMonth.month, day);
          date.setHours(0, 0, 0, 0);

          const isDisabled = shouldDisablePastDates && date < realToday;

          const isStart =
            value.from && date.toDateString() === value.from.toDateString();

          const isEnd =
            value.to && date.toDateString() === value.to.toDateString();

          const isBetween =
            value.from && value.to && date > value.from && date < value.to;

          return (
            <button
              key={day}
              type="button"
              disabled={isDisabled}
              onClick={() => selectDate(date)}
              className={`
                h-9 rounded-md text-sm transition 
                ${
                  isDisabled
                    ? "text-gray-400 opacity-50 cursor-not-allowed"
                    : isStart || isEnd
                    ? "bg-main text-white"
                    : isBetween
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
