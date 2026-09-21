import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";
import { preparationArticle } from "@/lib/blog";

const siteUrl = brand.siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${siteUrl}/blog`, lastModified: preparationArticle.publishedAt, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/blog/${preparationArticle.slug}`, lastModified: preparationArticle.publishedAt, changeFrequency: "monthly", priority: 0.8 },
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
