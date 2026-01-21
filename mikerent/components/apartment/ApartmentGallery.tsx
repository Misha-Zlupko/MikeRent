type Props = {
  id: string;
};

export const ApartmentGallery = ({ id }: Props) => {
  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 overflow-hidden rounded-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="relative bg-gray-100 aspect-[4/3] rounded-2xl overflow-hidden"
          >
            <div className="h-full w-full bg-gradient-to-br from-gray-200 to-gray-100" />
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button className="px-4 py-2 rounded-full border bg-white text-sm">
          Показати всі фото
        </button>
        <button className="px-4 py-2 rounded-full border bg-white text-sm">
          Додати в обране
        </button>
        <button className="px-4 py-2 rounded-full border bg-white text-sm">
          Поділитися
        </button>
      </div>
    </section>
  );
};
