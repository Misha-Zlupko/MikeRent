type Props = {
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
};

function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export const ApartmentFacts = ({
  guests,
  bedrooms,
  beds,
  bathrooms,
}: Props) => {
  return (
    <div className="flex flex-wrap gap-2 text-sm text-gray-700">
      <span className="px-3 py-1 rounded-full bg-gray-100">
        До {guests} {pluralize(guests, "гостя", "гостей", "гостей")}
      </span>

      <span className="px-3 py-1 rounded-full bg-gray-100">
        {bedrooms} {pluralize(bedrooms, "спальня", "спальні", "спалень")}
      </span>

      <span className="px-3 py-1 rounded-full bg-gray-100">
        {beds} {pluralize(beds, "ліжко", "ліжка", "ліжок")}
      </span>

      <span className="px-3 py-1 rounded-full bg-gray-100">
        {bathrooms} {pluralize(bathrooms, "ванна", "ванни", "ванн")}
      </span>
    </div>
  );
};
