import Link from "next/link";
import { Heart } from "lucide-react";

export const HeaderComponent = () => {
  const hasFavorites = false;

  return (
    <header className="bg-main">
      <div className="container flex items-center justify-between">
      <Link
        href="/"
        className="
          flex
          h-10
          sm:h-[68px]
          w-20
          sm:w-[150px]
          items-center
          text-xl
          sm:text-4xl
          font-bold
          tracking-tight
          text-white
          select-none
        "
      >
        MikeRent
      </Link>
        <Link href="/favorites" aria-label="Обрані квартири">
          <div
            className="
      flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center
      rounded-full
      transition
      hover:bg-white/15
      active:scale-95
    "
          >
            <Heart
              className={`
        h-6 w-6 sm:h-7 sm:w-7
        text-white
        transition-all
        ${
          hasFavorites
            ? "fill-white scale-105"
            : "fill-transparent hover:scale-110"
        }
      `}
            />
          </div>
        </Link>
      </div>
    </header>
  );
};
