export const ApartmentHeader = () => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold">
        Затишна квартира біля моря
      </h1>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        <span className="font-medium text-gray-900">4.8</span>
        <span>·</span>
        <span>23 відгуки</span>
        <span>·</span>
        <span className="underline underline-offset-2">
          Чорноморськ, вул. Морська, 12
        </span>
      </div>
    </div>
  );
};
