"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Apartment } from "../../data/ApartmentsTypes";

type Props = {
  apartment: Apartment;
};

export const ApartmentCard = ({ apartment }: Props) => {
  const [imageIndex, setImageIndex] = useState(0);
  const images = apartment.images;
  const totalImages = images.length;

  const prevImage = () => {
    setImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-[4/3] w-full overflow-hidden group">
        <Image
          key={images[imageIndex]}
          src={images[imageIndex]}
          alt={apartment.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {totalImages > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              flex items-center justify-center
              h-8 w-8 rounded-full
              bg-white/80 backdrop-blur shadow-md
              opacity-0 group-hover:opacity-100
              transition hover:bg-white active:scale-95
            "
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        {totalImages > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              flex items-center justify-center
              h-8 w-8 rounded-full
              bg-white/80 backdrop-blur shadow-md
              opacity-0 group-hover:opacity-100
              transition hover:bg-white active:scale-95
            "
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />

        {totalImages > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === imageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 line-clamp-2">
            {apartment.title}
          </h3>

          <div className="flex items-center gap-1 text-sm text-gray-700 shrink-0">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {apartment.rating}
          </div>
        </div>

        <p className="text-sm text-gray-500">
          {apartment.city}, {apartment.address}
        </p>

        <p className="text-sm text-gray-500">
          {apartment.guests} гостей · {apartment.bedrooms} спалень ·{" "}
          {apartment.beds} ліжка
        </p>

        <div className="pt-2">
          <span className="text-lg font-semibold text-gray-900">
            {apartment.pricePerNight} ₴
            <span className="text-sm font-normal text-gray-500"> / ніч</span>
          </span>
        </div>
      </div>
    </div>
  );
};
