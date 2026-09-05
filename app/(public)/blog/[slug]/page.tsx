import { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getPostBySlug } from "@/lib/blog-data";
import ScrollReveal from "@/components/ScrollReveal";
import FinalCTA from "@/components/FinalCTA";

const SITE_URL = "https://samawellnesstherapy.com";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const canonicalUrl = `${SITE_URL}/blog/${slug}`;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en": canonicalUrl,
        "ar": `${SITE_URL}/ar/blog/${slug}`,
      },
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      url: canonicalUrl,
      locale: "en_EG",
      siteName: "Sama Wellness Therapy",
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: `${SITE_URL}${post.image}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [`${SITE_URL}${post.image}`],
    },
  };
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${i}`}
          style={{
            paddingLeft: "24px",
            marginBottom: "20px",
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "var(--color-charcoal)",
          }}
        >
          {listItems.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "6px" }}>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={i}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "var(--color-charcoal)",
            marginTop: "40px",
            marginBottom: "16px",
            lineHeight: 1.3,
          }}
        >
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("- ")) {
      listItems.push(line.replace("- ", ""));
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      elements.push(
        <p
          key={i}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "var(--color-charcoal)",
            marginBottom: "20px",
          }}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
        />
      );
    }
    i++;
  }
  flushList();
  return elements;
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const otherPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: `${SITE_URL}${post.image}`,
    author: {
      "@type": "Person",
      name: post.author,
      url: `${SITE_URL}/team`,
    },
    publisher: {
      "@type": "Organization",
      name: "Sama Wellness Therapy",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
    inLanguage: "en",
  };

  return (
    <>
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        .blog-post-related { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .blog-post-card { transition: box-shadow 0.3s ease, transform 0.2s ease; cursor: pointer; text-decoration: none; color: inherit; display: block; }
        .blog-post-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.1); transform: translateY(-3px); }
        @media (max-width: 768px) { .blog-post-related { grid-template-columns: 1fr; } }
      `}</style>

      {/* Hero Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "420px",
          marginTop: "var(--navbar-height)",
        }}
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          style={{ objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5))",
          }}
        />
      </div>

      {/* Article Content */}
      <article
        style={{
          maxWidth: "720px",
          margin: "-60px auto 0",
          padding: "40px 32px 50px",
          backgroundColor: "#fff",
          borderRadius: "16px 16px 0 0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontFamily: "var(--font-ui)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-burgundy)",
              backgroundColor: "rgba(123,45,62,0.08)",
              padding: "4px 12px",
              borderRadius: "12px",
              marginBottom: "16px",
            }}
          >
            {post.category}
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.2rem",
              fontWeight: 400,
              color: "var(--color-charcoal)",
              lineHeight: 1.25,
              marginBottom: "14px",
            }}
          >
            {post.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "13px",
              color: "#999",
              letterSpacing: "0.03em",
            }}
          >
            {post.author} &middot; {post.readTime} &middot; {post.date}
          </p>
        </div>

        <div
          style={{
            width: "60px",
            height: "3px",
            backgroundColor: "var(--color-burgundy)",
            borderRadius: "2px",
            marginBottom: "32px",
          }}
        />

        {renderMarkdown(post.content)}

        {/* CTA */}
        <div
          style={{
            marginTop: "48px",
            padding: "28px 24px",
            backgroundColor: "var(--color-linen)",
            borderRadius: "12px",
            borderLeft: "4px solid var(--color-burgundy)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.15rem",
              color: "var(--color-charcoal)",
              marginBottom: "8px",
              fontWeight: 400,
            }}
          >
            Ready to take the first step?
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "#666",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            Reach out to Sama Wellness Therapy for a free 15-minute assessment
            call.
          </p>
          <a
            href="https://wa.me/201130946556"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              backgroundColor: "var(--color-burgundy)",
              color: "#fff",
              borderRadius: "8px",
              fontFamily: "var(--font-ui)",
              fontSize: "13px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Book Your Assessment
          </a>
        </div>
      </article>

      {/* Related Articles */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "50px 24px 60px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "var(--color-charcoal)",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          More from Our Blog
        </h2>
        <div className="blog-post-related">
          {otherPosts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="blog-post-card"
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid var(--color-sand)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3/2",
                }}
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "18px 20px" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontFamily: "var(--font-ui)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--color-burgundy)",
                    backgroundColor: "rgba(123,45,62,0.08)",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                  }}
                >
                  {p.category}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    fontWeight: 400,
                    color: "var(--color-charcoal)",
                    lineHeight: 1.35,
                  }}
                >
                  {p.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}
