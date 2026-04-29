import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";

import { HeaderComponent } from "@/components/HeaderComponent";
import { FooterComponent } from "@/components/FooterComponent";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mikerent.com"),
  title: {
    default: "Подобова оренда житла в Чорноморську | MikeRent",
    template: "%s | MikeRent",
  },
  description:
    "Подобова оренда квартир, будинків і кімнат у Чорноморську та Одеській області. Актуальні ціни, швидке бронювання, перевірені варіанти.",
  keywords: [
    "оренда квартир Чорноморськ",
    "подобова оренда Чорноморськ",
    "зняти квартиру Чорноморськ",
    "оренда житла біля моря",
    "оренда будинку Чорноморськ",
    "MikeRent",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "/",
    siteName: "MikeRent",
    title: "Подобова оренда житла в Чорноморську | MikeRent",
    description:
      "Зручний пошук і бронювання житла в Чорноморську: квартири, будинки та кімнати з актуальними фото та цінами.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Подобова оренда житла в Чорноморську | MikeRent",
    description:
      "Квартири, будинки та кімнати для відпочинку біля моря. Бронювання онлайн на MikeRent.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body
        className={`
          ${roboto.variable}
          antialiased
          min-h-screen
          flex
          flex-col
        `}
      >
        <HeaderComponent />

        <main className="flex-1">{children}</main>

        <FooterComponent />
      </body>
    </html>
  );
}
