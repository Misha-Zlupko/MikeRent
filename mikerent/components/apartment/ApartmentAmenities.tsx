import { apartments } from "@/data/ApartmentsData";

type Props = {
  id: string;
};

export const ApartmentAmenities = ({ id }: Props) => {
  const current = apartments.find((el) => el.id === id);

  if (!current) {
    return null;
  } 

  return (
    <div className="mt-6 border-t pt-6">
      <h2 className="text-xl font-semibold mb-3">Зручності</h2>
      <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
        {current.amenities.map((a) => (
          <div key={a} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            {a}
          </div>
        ))}
      </div>
    </div>
  );
};
