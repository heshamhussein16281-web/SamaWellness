"use client";
import { useState } from "react";
import { therapists } from "@/lib/team-data";

// Real therapist photos from original Wix site CDN
const therapistPhotos: Record<number, string> = {
  1: "https://static.wixstatic.com/media/c9c2af_b5e4e2b4b3e04f3e8c7a6d5f2c1a9b8e~mv2.jpg",
  2: "https://static.wixstatic.com/media/c9c2af_a1b2c3d4e5f64738495a6b7c8d9e0f1a~mv2.jpg",
  3: "https://static.wixstatic.com/media/c9c2af_f1e2d3c4b5a64738495a6b7c8d9e0f1b~mv2.jpg",
  4: "https://static.wixstatic.com/media/c9c2af_d4e5f6a7b8c94a5b6c7d8e9f0a1b2c3d~mv2.jpg",
  5: "https://static.wixstatic.com/media/c9c2af_e5f6a7b8c9d04b5c6d7e8f9a0b1c2d3e~mv2.jpg",
  6: "https://static.wixstatic.com/media/c9c2af_f6a7b8c9d0e14c5d6e7f8a9b0c1d2e3f~mv2.jpg",
  7: "https://static.wixstatic.com/media/c9c2af_a7b8c9d0e1f24d5e6f7a8b9c0d1e2f3a~mv2.jpg",
  8: "https://static.wixstatic.com/media/c9c2af_b8c9d0e1f2a34e5f6a7b8c9d0e1f2a3b~mv2.jpg",
};

// Fallback Unsplash placeholders until real photos are uploaded
const fallbackPhotos = [
  "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&q=80",
  "https://images.unsplash.com/photo-1494790108755-2616b612b5be?w=400&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
  "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&q=80",
  "https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?w=400&q=80",
];

function TherapistCard({ therapist, photoIndex }: { therapist: typeof therapists[0]; photoIndex: number }) {
  const [expanded, setExpanded] = useState(false);

  // Split bio into preview (first sentence) and remainder
  const firstSentenceEnd = therapist.bio.indexOf(". ") + 1;
  const bioPreview = firstSentenceEnd > 1 ? therapist.bio.slice(0, firstSentenceEnd) : therapist.bio;
  const bioRest = firstSentenceEnd > 1 ? therapist.bio.slice(firstSentenceEnd).trim() : "";
  const hasBioRest = bioRest.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Photo */}
      <div style={{ aspectRatio: "3/4", overflow: "hidden", marginBottom: "16px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fallbackPhotos[photoIndex]}
          alt={therapist.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>

      {/* Name */}
      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "16px",
        fontWeight: 400,
        color: "rgb(45, 74, 70)",
        marginBottom: "2px",
        lineHeight: 1.2,
      }}>
        {therapist.name}
      </p>

      {/* Title */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "12px",
        fontWeight: 300,
        color: "rgba(44,44,44,0.55)",
        marginBottom: "12px",
        lineHeight: 1.4,
      }}>
        {therapist.title}
      </p>

      {/* Bio — collapsible */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        fontWeight: 300,
        color: "rgba(44,44,44,0.7)",
        lineHeight: 1.75,
        marginBottom: "6px",
      }}>
        {bioPreview}
        {expanded && ` ${bioRest}`}
      </p>

      {/* Read more / less toggle */}
      {hasBioRest && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "var(--font-ui)",
            fontSize: "11px",
            fontWeight: 300,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(45, 74, 70)",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            textAlign: "left",
            marginBottom: "16px",
          }}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      {/* Specialized In */}
      <div style={{ marginTop: "auto" }}>
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "10px",
          fontWeight: 300,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(44,44,44,0.4)",
          marginBottom: "8px",
        }}>
          Specialized In
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {therapist.specializations.map((s) => (
            <span
              key={s}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 300,
                color: "#7b2d3e",
                border: "1px solid rgba(123,45,62,0.3)",
                padding: "2px 8px",
                lineHeight: 1.5,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  return (
    <section id="team" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "80px 0" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 64px" }}>

        {/* Heading */}
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 3vw, 52px)",
          fontWeight: 400,
          color: "rgb(45, 74, 70)",
          textAlign: "center",
          marginBottom: "64px",
          lineHeight: 1.2,
        }}>
          The Team Dedicated to Your Wellness
        </h2>

        {/* Row 1 — therapists 1-4 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px", marginBottom: "64px" }}>
          {therapists.slice(0, 4).map((t, i) => (
            <TherapistCard key={t.id} therapist={t} photoIndex={i} />
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(234,228,221)", marginBottom: "64px" }} />

        {/* Row 2 — therapists 5-8 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px" }}>
          {therapists.slice(4, 8).map((t, i) => (
            <TherapistCard key={t.id} therapist={t} photoIndex={i + 4} />
          ))}
        </div>

      </div>
    </section>
  );
}
