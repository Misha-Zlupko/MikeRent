import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mikerent.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apartments = await prisma.apartment.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const staticPages: MetadataRoute.Sitemap = [
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
      priority: 0.5,
    },
  ];

  const apartmentPages: MetadataRoute.Sitemap = apartments.map((apartment) => ({
    url: `${baseUrl}/apartments/${apartment.id}`,
    lastModified: apartment.updatedAt,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticPages, ...apartmentPages];
}
