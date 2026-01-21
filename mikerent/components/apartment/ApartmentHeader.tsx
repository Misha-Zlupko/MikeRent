import { apartments } from "@/data/ApartmentsData";
import Link from "next/link";

type Props = {
  id: string;
};

export const ApartmentHeader = ({ id }: Props) => {
  const current = apartments.find((el) => el.id === id);

  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold">{current?.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        <Link href={""} className="underline underline-offset-2">
          {current?.address}
        </Link>
      </div>
    </div>
  );
};
