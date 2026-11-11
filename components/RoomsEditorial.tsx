/* Rooms Editorial — Each room as a full story section with 2 photos + narrative */
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function RoomsEditorial() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rooms = section.querySelectorAll(".rooms-editorial__room");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("rooms-editorial__room--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    rooms.forEach((room) => observer.observe(room));
    return () => observer.disconnect();
  }, []);

  const rooms = [
    {
      name: "Serenity",
      tagline: "A space to quiet the mind",
      description: "Warm amber lighting, soft furnishings, and intentional artwork — Mind, Body, Soul — set the tone the moment you walk in. Serenity was designed for clients who find comfort in warmth and intimacy. Cherry blossom accents and floating shelves with botanical touches create a space that feels personal, not clinical.",
      images: ["/rooms-serenity1-v3.webp", "/rooms-serenity2-v3.webp"],
      // Real natural dimensions of the -v3 files (after the EXIF-rotation fix in
      // Action 1). serenity2 is portrait (1600x2394) — its old dims [600, 401]
      // were landscape and left over from before that fix, which was causing the
      // CSS grid to size the image box off the stale attribute instead of the
      // aspect-ratio below, producing full-height strips on mobile (Action 11).
      dims: [[1280, 855], [1600, 2394]] as [number, number][],
      sizes: "(max-width: 980px) 50vw, 284px",
      alts: ["Serenity room — cozy sofa with Mind Body Soul artwork", "Serenity room — armchair with cherry blossoms and palm plant"],
    },
    {
      name: "Horizon",
      tagline: "A space to see clearly",
      description: "Natural daylight streams through a large window overlooking greenery, filling the room with openness and calm energy. Bold blue and warm mustard furnishings create a grounded, vibrant atmosphere. Horizon was designed for clients who draw strength from light, space, and colour.",
      images: ["/rooms-horizon1-v3.webp", "/rooms-horizon2-v3.webp"],
      dims: [[960, 1280], [1086, 1448]] as [number, number][],
      sizes: "(max-width: 980px) 50vw, 230px",
      alts: ["Horizon room — bright space with mustard sofa and blue armchairs", "Horizon room — navy blue therapist armchair with yellow flowers"],
    },
  ];

  return (
    <section className="rooms-editorial" aria-label="Our Therapy Rooms" ref={sectionRef}>
      {rooms.map((room, i) => (
        <div key={room.name} className={`rooms-editorial__room ${i % 2 === 1 ? "rooms-editorial__room--reversed" : ""}`}>
          <div className="rooms-editorial__room-inner">
            <div className="rooms-editorial__photos">
              <div className="rooms-editorial__photo-frame rooms-editorial__photo-frame--main">
                <Image
                  src={room.images[0]}
                  alt={room.alts[0]}
                  width={room.dims[0][0]}
                  height={room.dims[0][1]}
                  sizes={room.sizes}
                  className="rooms-editorial__photo rooms-editorial__photo--main"
                />
              </div>
              <div className="rooms-editorial__photo-frame rooms-editorial__photo-frame--secondary">
                <Image
                  src={room.images[1]}
                  alt={room.alts[1]}
                  width={room.dims[1][0]}
                  height={room.dims[1][1]}
                  sizes={room.sizes}
                  // Action 12: this is the actual LCP element on /rooms (confirmed via
                  // Lighthouse's lcp-discovery-insight during Action 11 verification) —
                  // its portrait crop (1600x2394) reserves a taller box than the --main
                  // photo's landscape crop on mobile, making it the largest rendered
                  // element at LCP-eval time. Next/Image lazy-loads by default, which
                  // was producing LCP ~3.7s. priority sets loading=eager + fetchpriority
                  // high and preloads it, only for the first room (i === 0, above the fold).
                  priority={i === 0}
                  className="rooms-editorial__photo rooms-editorial__photo--secondary"
                />
              </div>
            </div>
            <div className="rooms-editorial__text">
              <p className="rooms-editorial__tagline">{room.tagline}</p>
              <h3 className="rooms-editorial__name">{room.name}</h3>
              <p className="rooms-editorial__desc">{room.description}</p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
