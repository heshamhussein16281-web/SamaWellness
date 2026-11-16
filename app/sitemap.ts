import { MetadataRoute } from "next";
import { execSync } from "child_process";
import { blogPosts } from "@/lib/blog-data";
import { blogPostsAr } from "@/lib/blog-data-ar";

const SITE_URL = "https://www.samawellnesstherapy.com";

type StaticPage = {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
  /** Source file whose last git commit date stands in for this page's real last-updated date. */
  enFile: string;
  arFile: string;
};

const staticPages: StaticPage[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly", enFile: "app/(public)/page.tsx", arFile: "app/(arabic)/ar/page.tsx" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly", enFile: "app/(public)/services/page.tsx", arFile: "app/(arabic)/ar/services/page.tsx" },
  { path: "/team", priority: 0.8, changeFrequency: "monthly", enFile: "app/(public)/team/page.tsx", arFile: "app/(arabic)/ar/team/page.tsx" },
  { path: "/rooms", priority: 0.7, changeFrequency: "monthly", enFile: "app/(public)/rooms/page.tsx", arFile: "app/(arabic)/ar/rooms/page.tsx" },
  { path: "/ask", priority: 0.7, changeFrequency: "weekly", enFile: "app/(public)/ask/page.tsx", arFile: "app/(arabic)/ar/ask/page.tsx" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly", enFile: "app/(public)/blog/page.tsx", arFile: "app/(arabic)/ar/blog/page.tsx" },
];

// Real per-page "last updated" date, read from git history instead of a
// hardcoded value — so it stays accurate automatically as pages are edited.
// Falls back to "now" if git history isn't available (e.g. a shallow
// checkout with no history for that path), which just means that one entry's
// lastmod is slightly conservative rather than wrong.
function lastModifiedFor(relativePath: string): Date {
  try {
    const iso = execSync(`git log -1 --format=%cI -- "${relativePath}"`, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (iso) return new Date(iso);
  } catch {
    // ignore — git may be unavailable in some build environments
  }
  return new Date();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    const languages = {
      en: `${SITE_URL}${page.path}`,
      ar: `${SITE_URL}/ar${page.path}`,
    };

    entries.push({
      url: `${SITE_URL}${page.path}`,
      lastModified: lastModifiedFor(page.enFile),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    });

    entries.push({
      url: `${SITE_URL}/ar${page.path}`,
      lastModified: lastModifiedFor(page.arFile),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: { languages },
    });
  }

  // Every English blog post, auto-generated from lib/blog-data.ts — new posts
  // need no sitemap edits.
  for (const post of blogPosts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/blog/${post.slug}`,
          ar: `${SITE_URL}/ar/blog/${post.slug}`,
        },
      },
    });
  }

  // Every Arabic blog post, auto-generated from lib/blog-data-ar.ts — these
  // previously had no standalone sitemap entry at all, only appearing nested
  // as an alternate-language link on the English post's entry.
  for (const post of blogPostsAr) {
    entries.push({
      url: `${SITE_URL}/ar/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: "monthly",
      priority: 0.7,
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
