"use client";

import Link from "next/link";
import { Phone, Send, Music2 } from "lucide-react";

export const FooterComponent = () => {
  return (
    <footer className="border-t border-white/10 bg-main">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between colum">
          {/* ЛОГО */}
          <Link
            href="https://t.me/your_telegram_username"
            target="_blank"
            className="text-3xl md:text-4xl font-bold text-white hover:opacity-80 mr-auto mb-4"
          >
            MikeRent
          </Link>

          {/* КОНТАКТЫ */}
          <div className="flex flex-col md:flex-row items-center gap-4 mr-auto md:mr-0">
            {/* P className="mr-auto"HONE */}
            <div className="mr-auto">
              <Link
                href="tel:+380XXXXXXXXX"
                className="
                  inline-flex items-center gap-2
                  text-white/90 hover:text-white transition
                  
                "
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">+38 (0XX) XXX-XX-XX</span>
              </Link>
            </div>

            {/* TELEGRAM */}
            <div className="mr-auto">
              <Link
                href="https://t.me/your_telegram_username"
                target="_blank"
                className="
                  inline-flex items-center gap-2
                  text-white/90 hover:text-white transition
                  
                "
              >
                <Send className="h-4 w-4" />
                <span className="text-sm font-medium">Telegram</span>
              </Link>
            </div>

            {/* TIKTOK */}
            <div className="mr-auto">
              <Link
                href="https://www.tiktok.com/@your_tiktok"
                target="_blank"
                className="
                  inline-flex items-center gap-2
                  text-white/90 hover:text-white transition
                  
                "
              >
                <Music2 className="h-4 w-4" />
                <span className="text-sm font-medium">TikTok</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/60">
          © 2025 MikeRent. Всі права захищені.
        </div>
      </div>
    </footer>
  );
};
