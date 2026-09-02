/* Rooms Editorial — Each room as a full story section with 2 photos + narrative */
"use client";

import { useEffect, useRef } from "react";

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
      images: ["/rooms-serenity1.jpg", "/rooms-serenity2.jpg"],
      alts: ["Serenity room — cozy sofa with Mind Body Soul artwork", "Serenity room — armchair with cherry blossoms and palm plant"],
    },
    {
      name: "Horizon",
      tagline: "A space to see clearly",
      description: "Natural daylight streams through a large window overlooking greenery, filling the room with openness and calm energy. Bold blue and warm mustard furnishings create a grounded, vibrant atmosphere. Horizon was designed for clients who draw strength from light, space, and colour.",
      images: ["/rooms-horizon1.jpg", "/rooms-horizon2.jpg"],
      alts: ["Horizon room — bright space with mustard sofa and blue armchairs", "Horizon room — navy blue therapist armchair with yellow flowers"],
    },
  ];

  return (
    <section className="rooms-editorial" aria-label="Our Therapy Rooms" ref={sectionRef}>
      {rooms.map((room, i) => (
        <div key={room.name} className={`rooms-editorial__room ${i % 2 === 1 ? "rooms-editorial__room--reversed" : ""}`}>
          <div className="rooms-editorial__room-inner">
            <div className="rooms-editorial__photos">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={room.images[0]} alt={room.alts[0]} className="rooms-editorial__photo rooms-editorial__photo--main" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={room.images[1]} alt={room.alts[1]} className="rooms-editorial__photo rooms-editorial__photo--secondary" />
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
