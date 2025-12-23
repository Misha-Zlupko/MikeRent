export type Season = {
  weekDays: ("Пн" | "Вт" | "Ср" | "Чт" | "Пт" | "Сб" | "Нд")[];
  months: {
    name: string;
    month: number;
    days: number[];
  }[];
};
