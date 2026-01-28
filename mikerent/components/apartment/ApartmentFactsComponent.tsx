import { apartments } from "@/data/ApartmentsData";

type Props = {
  id: string;
};

function pluralize(
  count: number,
  one: string,
  few: string,
  many: string
) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export const ApartmentFacts = ({ id }: Props) => {
  const current = apartments.find((el) => el.id === id);

  if (!current) return null;

  return (
    <div className="flex flex-wrap gap-2 text-sm text-gray-700">
      <span className="px-3 py-1 rounded-full bg-gray-100">
        До {current.guests}{" "}
        {pluralize(current.guests, "гостя", "гостей", "гостей")}
      </span>

      <span className="px-3 py-1 rounded-full bg-gray-100">
        {current.bedrooms}{" "}
        {pluralize(current.bedrooms, "спальня", "спальні", "спалень")}
      </span>

      <span className="px-3 py-1 rounded-full bg-gray-100">
        {current.beds}{" "}
        {pluralize(current.beds, "ліжко", "ліжка", "ліжок")}
      </span>

      <span className="px-3 py-1 rounded-full bg-gray-100">
        {current.bathrooms}{" "}
        {pluralize(current.bathrooms, "ванна", "ванни", "ванн")}
      </span>
    </div>
  );
};
