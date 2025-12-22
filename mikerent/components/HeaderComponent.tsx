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
        <Link href="/favorites" className="" aria-label="Обрані квартири">
          <Heart
            className={`h-[38px]
    w-[38px] h-6 w-6 flex-shrink-0 transition-colors ${
      hasFavorites
        ? "fill-red-500 text-red-500"
        : "text-white hover:text-primary"
    }`}
          />
        </Link>
      </div>
    </header>
  );
};
