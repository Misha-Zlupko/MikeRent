"use client";

import { COMMENTS } from "@/data/CommentsData";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ===== helpers ===== */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });


export const CustomerComments = () => {
  return (
    <div className="container relative overflow-hidden py-20">
      <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-gray-900">
        Відгуки наших клієнтів
      </h2>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={32}
        slidesPerView={1}
        navigation
        pagination={{
          clickable: true,
          el: ".comments-pagination",
        }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="comments-swiper !pb-6"
      >
        {COMMENTS.map((comment) => (
          <SwiperSlide key={comment.id} className="h-full flex">
            <div
              className="
                group
                flex
                flex-col
                h-full
                rounded-3xl
                border border-white/40
                bg-white/70
                p-6
                backdrop-blur-xl
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-2
                hover:shadow-1xl
              "
            >
              {/* HEADER */}
              <div className="mb-2 flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white">
                  <Image
                    src={comment.avatar}
                    alt={comment.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">{comment.name}</p>

                  <p className="text-xs text-gray-500">
                    {formatDate(comment.date)}
                  </p>

                  <div className="mt-1 flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.922-.755 1.688-1.538 1.118l-3.386-2.46a1 1 0 00-1.175 0l-3.386 2.46c-.783.57-1.838-.196-1.538-1.118l1.287-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.974z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* TEXT */}
              <p
                className="
                  mt-auto
                  mb-auto
                  text-sm
                  leading-relaxed
                  text-gray-700
                  line-clamp-4
                "
              >
                “{comment.text}”
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="comments-pagination mt-6 flex justify-center gap-3" />
    </div>
  );
};
