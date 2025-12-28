"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star, Heart } from "lucide-react";
import { Apartment } from "../../data/ApartmentsTypes";

type Props = {
  apartment: Apartment;
};

const FAVORITES_KEY = "favorites";

export const ApartmentCard = ({ apartment }: Props) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const images = apartment.images;
  const totalImages = images.length;

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    ) as string[];

    setIsFavorite(stored.includes(apartment.id));
  }, [apartment.id]);

  const toggleFavorite = () => {
    const stored = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    ) as string[];

    let updated: string[];

    if (stored.includes(apartment.id)) {
      updated = stored.filter((id) => id !== apartment.id);
      setIsFavorite(false);
    } else {
      updated = [...stored, apartment.id];
      setIsFavorite(true);
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          key={images[imageIndex]}
          src={images[imageIndex]}
          alt={apartment.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
          className="
            absolute top-2 right-2 z-20
            h-9 w-9 rounded-full
            flex items-center justify-center
            bg-white/80 backdrop-blur shadow
            transition
            hover:scale-105
            active:scale-95
          "
        >
          <Heart
            className={`h-5 w-5 transition ${
              isFavorite ? "fill-blue-500 text-blue-500" : "text-gray-600"
            }`}
          />
        </button>

        {totalImages > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="
              absolute left-2 top-1/2 -translate-y-1/2
              h-8 w-8 rounded-full
              bg-white/80 backdrop-blur shadow
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            <ArrowLeft className="h-4 w-4 mx-auto" />
          </button>
        )}

        {totalImages > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              h-8 w-8 rounded-full
              bg-white/80 backdrop-blur shadow
              opacity-0 group-hover:opacity-100
              transition
            "
          >
            <ArrowRight className="h-4 w-4 mx-auto" />
          </button>
        )}

        {totalImages > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === imageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="mb-auto">
          <div className="flex justify-between">
            <h3 className="font-medium line-clamp-2">{apartment.title}</h3>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {apartment.rating}
            </div>
          </div>

          <p className="text-sm text-gray-500">{apartment.address}</p>

          <p className="text-sm text-gray-500">
            {apartment.guests} гостей · {apartment.bedrooms} спалень ·{" "}
            {apartment.beds} ліжка
          </p>
        </div>
        <div className="pt-2">
          <span className="text-lg font-semibold">
            {apartment.pricePerNight} ₴
            <span className="text-sm text-gray-500"> / ніч</span>
          </span>
        </div>
      </div>
    </div>
  );
};
