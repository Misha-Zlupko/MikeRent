import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://mikerent.com")
    .trim()
    .replace(/\/$/, "");

  const apartments = await prisma.apartment.findMany({
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.3,
    },
    ...apartments.map((a) => ({
      url: `${baseUrl}/apartments/${a.id}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
