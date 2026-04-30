import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

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
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6">
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          На головну
        </Link>

        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
          {apartment.title}
        </h1>

        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <MapPin size={16} className="text-sky-600" />
          {apartment.mapUrl ? (
            <Link
              href={apartment.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-900 hover:underline"
            >
              {apartment.address}
            </Link>
          ) : (
            <span>{apartment.address}</span>
          )}
        </div>
      </div>
    </div>
  );
};