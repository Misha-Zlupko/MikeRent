import Link from "next/link";

type Props = {
  apartment: {
    id: string;
    title: string;
    address: string;
    mapUrl: string | null;
  };
};

export const ApartmentHeader = ({ apartment }: Props) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold">{apartment.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        <Link
          href={apartment.mapUrl || ""}
          target="_blank"
          className="underline underline-offset-2"
        >
          {apartment.address}
        </Link>
      </div>
    </div>
  );
};
