import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

const siteUrl = brand.siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${siteUrl}/hero-photo-original.png`],
    },
    {
      url: `${siteUrl}/partners`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/business/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
