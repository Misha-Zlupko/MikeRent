import Link from "next/link";
import { Heart } from "lucide-react";

export const HeaderComponent = () => {
  const hasFavorites = false;

  return (
    <header className="bg-main">
      <div className="container flex items-center justify-between pt-2">
        <Link
          href="/"
          className="
      flex
      h-[68px]
      w-[150px]
      items-center
      text-4xl
      font-bold
      tracking-tight
      text-white
  "
        >
          MikeRent
        </Link>
        <Link href="/favorites" aria-label="Обрані квартири">
          <div
            className="
      flex h-14 w-14 items-center justify-center
      rounded-full
      transition
      hover:bg-white/15
      active:scale-95
    "
          >
            <Heart
              className={`
        h-8 w-8
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
