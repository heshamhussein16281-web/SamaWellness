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
      dims: [[1240, 828], [600, 401]] as [number, number][],
      sizes: "(max-width: 980px) 50vw, 284px",
      alts: ["Serenity room — cozy sofa with Mind Body Soul artwork", "Serenity room — armchair with cherry blossoms and palm plant"],
    },
    {
      name: "Horizon",
      tagline: "A space to see clearly",
      description: "Natural daylight streams through a large window overlooking greenery, filling the room with openness and calm energy. Bold blue and warm mustard furnishings create a grounded, vibrant atmosphere. Horizon was designed for clients who draw strength from light, space, and colour.",
      images: ["/rooms-horizon1-v3.webp", "/rooms-horizon2-v3.webp"],
      dims: [[450, 600], [345, 460]] as [number, number][],
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
              <Image
                src={room.images[0]}
                alt={room.alts[0]}
                width={room.dims[0][0]}
                height={room.dims[0][1]}
                sizes={room.sizes}
                className="rooms-editorial__photo rooms-editorial__photo--main"
              />
              <Image
                src={room.images[1]}
                alt={room.alts[1]}
                width={room.dims[1][0]}
                height={room.dims[1][1]}
                sizes={room.sizes}
                className="rooms-editorial__photo rooms-editorial__photo--secondary"
              />
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
