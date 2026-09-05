"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ScrollReveal from "@/components/ScrollReveal";
import FinalCTA from "@/components/FinalCTA";
import { blogPosts, getFeaturedPosts, getGridPosts } from "@/lib/blog-data";

const categories = [
  "All",
  "Therapy Insights",
  "Relationships",
  "Self-Care",
  "Faith & Wellness",
];

export default function BlogPage() {
  const [active, setActive] = useState("All");
  const featured = getFeaturedPosts();
  const gridPosts = getGridPosts();

  const filtered =
    active === "All"
      ? gridPosts
      : gridPosts.filter((p) => p.category === active);

  return (
    <>
      <style>{`
        .blogc-featured { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        .blogc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .blogc-fcard, .blogc-card { transition: box-shadow 0.3s ease, transform 0.2s ease; cursor: pointer; text-decoration: none; color: inherit; display: block; }
        .blogc-fcard:hover, .blogc-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.1); transform: translateY(-3px); }
        @media (max-width: 980px) { .blogc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .blogc-featured { grid-template-columns: 1fr; }
          .blogc-grid { grid-template-columns: 1fr; }
          .blogc-newsletter-row { flex-direction: column !important; }
          .blogc-newsletter-row input, .blogc-newsletter-row button { width: 100% !important; }
        }
      `}</style>

      <PageHero eyebrow="Our Blog" title="Insights for Your Journey" />

      {/* Featured Articles */}
      <section
        style={{ maxWidth: "1100px", margin: "0 auto", padding: "10px 24px 40px" }}
      >
        <div className="blogc-featured">
          {featured.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blogc-fcard"
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
                  aspectRatio: "16/10",
                }}
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "22px 24px" }}>
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
                    marginBottom: "10px",
                  }}
                >
                  {post.category}
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.4rem",
                    fontWeight: 400,
                    color: "var(--color-charcoal)",
                    marginBottom: "10px",
                    lineHeight: 1.3,
                  }}
                >
                  {post.title}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "14px",
                    color: "#777",
                    lineHeight: 1.6,
                    marginBottom: "14px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }}
                >
                  {post.excerpt}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "12px",
                    color: "#aaa",
                    letterSpacing: "0.03em",
                  }}
                >
                  {post.author} &middot; {post.readTime}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section
        style={{
          backgroundColor: "var(--color-sand)",
          padding: "40px 24px",
          margin: "0 0 8px",
        }}
      >
        <div
          style={{ maxWidth: "580px", margin: "0 auto", textAlign: "center" }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontWeight: 400,
              color: "var(--color-charcoal)",
              marginBottom: "18px",
            }}
          >
            Get mental wellness insights delivered to your inbox
          </h3>
          <div
            className="blogc-newsletter-row"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              style={{
                flex: 1,
                maxWidth: "360px",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.12)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "#fff",
              }}
            />
            <button
              style={{
                padding: "12px 28px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                backgroundColor: "var(--color-burgundy)",
                color: "#fff",
                fontFamily: "var(--font-ui)",
                fontSize: "13px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "36px 24px 0",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            style={{
              padding: "8px 20px",
              borderRadius: "24px",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: "13px",
              letterSpacing: "0.04em",
              border: active === c ? "none" : "1px solid var(--color-sand)",
              backgroundColor:
                active === c ? "var(--color-burgundy)" : "transparent",
              color: active === c ? "#fff" : "var(--color-charcoal)",
              transition: "all 0.2s ease",
            }}
          >
            {c}
          </button>
        ))}
      </section>

      {/* Card Grid */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "32px 24px 50px",
        }}
      >
        <div className="blogc-grid">
          {filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blogc-card"
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
                  src={post.image}
                  alt={post.title}
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
                  {post.category}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 400,
                    color: "var(--color-charcoal)",
                    marginBottom: "6px",
                    lineHeight: 1.35,
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    color: "#888",
                    lineHeight: 1.5,
                    marginBottom: "10px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }}
                >
                  {post.excerpt}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "11px",
                    color: "#aaa",
                    letterSpacing: "0.03em",
                  }}
                >
                  {post.readTime} &middot; {post.date}
                </p>
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
