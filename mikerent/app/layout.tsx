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
  title: "MikeRent",
  description:
    "Подобова оренда житла в Чорноморську для відпочинку біля моря. Квартири та будинки з актуальними цінами.",
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
