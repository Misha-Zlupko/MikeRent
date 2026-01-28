import { apartments } from "@/data/ApartmentsData";

export const ApartmentDescription = ({ id }: { id: string }) => {

  const current = apartments.find((el) => el.id === id);
  
  if (!current) {
    return null;
  } 

  return (
  <div className="mt-6 border-t pt-6">
    <h2 className="text-xl font-semibold mb-3">Опис</h2>
    <p className="text-gray-700 leading-relaxed">
      {current.description}
    </p>
  </div>
  );
};
