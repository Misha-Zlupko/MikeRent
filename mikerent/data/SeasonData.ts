import { Season } from "./SeasonDataTypes";

export const SEASON: Season = {
  weekDays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  months: [
    {
      name: "Червень",
      month: 5,
      days: Array.from({ length: 30 }, (_, i) => i + 1),
    },
    {
      name: "Липень",
      month: 6,
      days: Array.from({ length: 31 }, (_, i) => i + 1),
    },
    {
      name: "Серпень",
      month: 7,
      days: Array.from({ length: 31 }, (_, i) => i + 1),
    },
    {
      name: "Вересень",
      month: 8,
      days: Array.from({ length: 30 }, (_, i) => i + 1),
    },
  ],
};
