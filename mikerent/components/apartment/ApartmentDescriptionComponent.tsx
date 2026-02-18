export const ApartmentDescription = ({ description }: { description: string }) => {
  return (
  <div className="mt-6 border-t pt-6">
    <h2 className="text-xl font-semibold mb-3">Опис</h2>
    <p className="text-gray-700 leading-relaxed">
      {description}
    </p>
  </div>
  );
};
