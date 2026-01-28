"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { apartments } from "@/data/ApartmentsData";
import { Heart, Share2, Maximize2 } from "lucide-react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { FreeMode, Navigation, Thumbs } from "swiper/modules";

type Props = {
  id: string;
};

export const ApartmentGallery = ({ id }: Props) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [copied, setCopied] = useState(false);  


  useEffect(() => {
    const checkFavorite = () => {
      try {
        const favorites = localStorage.getItem("favorites");
        if (favorites) {
          const favoritesArray = JSON.parse(favorites);
          setIsFavorite(favoritesArray.includes(id));
        }
      } catch (error) {
        console.error("Ошибка при проверке избранного:", error);
      }
    };
    
    checkFavorite();
  }, [id]);

  // Функция для переключения избранного
  const toggleFavorite = () => {    
    try {
      const favorites = localStorage.getItem("favorites");
      let favoritesArray: string[] = [];
      
      if (favorites) {
        favoritesArray = JSON.parse(favorites);
      }
      
      if (isFavorite) {
        // Удаляем из избранного
        const updatedFavorites = favoritesArray.filter(favId => favId !== id);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        setIsFavorite(false);
      } else {
        // Добавляем в избранное
        favoritesArray.push(id);
        localStorage.setItem("favorites", JSON.stringify(favoritesArray));
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Ошибка при работе с избранным:", error);
    } 
  };

  const shareLink = async () => {
    const url = window.location.href;
  
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Не вдалося скопіювати посилання:", error);
    }
  };
  

  // 🔎 Находим квартиру по id
  const apartment = apartments.find((apt) => apt.id === id);

  // 🛑 Если не найдено или нет изображений — не рендерим
  if (!apartment || apartment.images.length === 0) {
    return null;
  }

  const images = apartment.images;

  return (
    <div className="mb-8">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <Swiper
          loop
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          spaceBetween={0}
          thumbs={{ swiper: thumbsSwiper }}
          modules={[FreeMode, Navigation, Thumbs]}
          className="h-full"
        >
          {images.map((src, index) => (
            <SwiperSlide key={`${src}-${index}`}>
              <div className="relative aspect-[4/3] md:aspect-[16/9]">
                <Image
                  src={src}
                  alt={apartment.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
              </div>
            </SwiperSlide>
          ))}
          
          {/* Кастомные кнопки навигации */}
          <div className="swiper-button-next !right-4 !text-white !bg-black/30 !w-10 !h-10 rounded-full backdrop-blur-sm p-2" />
          <div className="swiper-button-prev !left-4 !text-white !bg-black/30 !w-10 !h-10 rounded-full backdrop-blur-sm p-2" />
          
          {/* Индикатор фото */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {images.length} фото
          </div>
        </Swiper>
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="mt-4">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={4}
            freeMode
            watchSlidesProgress
            modules={[FreeMode, Thumbs]}
            breakpoints={{
              320: { slidesPerView: 3 },
              640: { slidesPerView: 4 },
              768: { slidesPerView: 5 },
              1024: { slidesPerView: 6 },
            }}
          >
            {images.map((src, index) => (
              <SwiperSlide key={`thumb-${src}-${index}`}>
                <div className="relative aspect-[4/3] cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200">
                  <Image
                    src={src}
                    alt={`${apartment.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={toggleFavorite}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <Heart
            size={18}
            className={isFavorite ? "fill-blue-500 text-blue-500" : "text-gray-600"}
          />
          {isFavorite ? "Вилучити з обраних" : "Додати в обране"}
        </button>

        <button
          onClick={shareLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <Share2
            size={18}
            className={copied ? "text-green-500" : "text-gray-600"}
          />
          {copied ? "Посилання скопійовано" : "Скопіювати посилання"}
        </button>
      </div>
    </div>
  );
};
