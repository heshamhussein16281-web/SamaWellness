import { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";

const SITE_URL = "https://www.samawellnesstherapy.com";

const staticPages = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/team", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/rooms", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/ask", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    entries.push({
      url: `${SITE_URL}${page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          en: `${SITE_URL}${page.path}`,
          ar: `${SITE_URL}/ar${page.path}`,
        },
      },
    });
  }

  for (const post of blogPosts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: post.publishDate,
      alternates: {
        languages: {
          en: `${SITE_URL}/blog/${post.slug}`,
          ar: `${SITE_URL}/ar/blog/${post.slug}`,
        },
      },
    });
  }

  return entries;
}
