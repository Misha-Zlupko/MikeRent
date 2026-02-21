type Props = {
  amenities: string[];
};

export const ApartmentAmenities = ({ amenities }: Props) => {
  const amenityLabels: Record<string, string> = {
    wifi: "WiFi",
    airConditioner: "Кондиціонер",
    kitchen: "Кухня",
    dishes: "Посуд",
    washingMachine: "Пральна машина",
    tv: "Телевізор",
    parking: "Парковка",
    balcony: "Балкон",
    seaView: "Вид на море",
    pool: "Басейн",
  };
  return (
    <div className="mt-6 border-t pt-6">
      <h2 className="text-xl font-semibold mb-3">Зручності</h2>
      <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
        {amenities.map((a) => (
          <div key={a} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            {amenityLabels[a] || a}
          </div>
        ))}
      </div>
    </div>
  );
};
