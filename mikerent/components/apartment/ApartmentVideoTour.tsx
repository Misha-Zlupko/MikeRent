import Link from "next/link";
import { Video } from "lucide-react";
import { getYoutubeEmbedSrcFromUrl } from "@/lib/youtubeEmbed";

type Props = {
  videoTourUrl: string;
};

export function ApartmentVideoTour({ videoTourUrl }: Props) {
  const trimmed = videoTourUrl.trim();
  if (!trimmed) return null;

  const embedSrc = getYoutubeEmbedSrcFromUrl(trimmed);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
        <Video className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
        Відеоогляд
      </h2>
      {embedSrc ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            title="Відеоогляд квартири"
            src={embedSrc}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <p className="text-sm text-slate-600">
          <Link
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 underline decoration-blue-200 underline-offset-2 hover:text-blue-800"
          >
            Відкрити відео в новій вкладці
          </Link>
        </p>
      )}
    </section>
  );
}
