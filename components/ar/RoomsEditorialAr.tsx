"use client";

import { useEffect, useRef } from "react";

export default function RoomsEditorialAr() {
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
      name: "سيرينيتي",
      tagline: "مساحة لتهدئة العقل",
      description: "إضاءة كهرمانية دافئة، أثاث ناعم، ولوحات فنية مقصودة — عقل، جسد، روح — بتضبط الأجواء من أول ما تدخل. سيرينيتي اتصممت للعملاء اللي بيلاقوا الراحة في الدفء والحميمية. لمسات الكرز وأرفف عائمة بلمسات نباتية بتخلق مساحة حاسسها شخصية، مش إكلينيكية.",
      images: ["/rooms-serenity1.jpg", "/rooms-serenity2.jpg"],
      alts: ["غرفة سيرينيتي — أريكة مريحة مع لوحة عقل جسد روح", "غرفة سيرينيتي — كرسي مع أزهار الكرز ونبات"],
    },
    {
      name: "هورايزون",
      tagline: "مساحة لرؤية أوضح",
      description: "ضوء طبيعي بيدخل من شباك كبير يطل على خضرة، بيملا الغرفة بانفتاح وطاقة هادئة. أثاث أزرق جريء وخردلي دافئ بيخلق جو مستقر ونابض بالحياة. هورايزون اتصممت للعملاء اللي بيستمدوا قوتهم من النور والمساحة والألوان.",
      images: ["/rooms-horizon1.jpg", "/rooms-horizon2.jpg"],
      alts: ["غرفة هورايزون — مساحة مضيئة بأريكة خردلية وكراسي زرقاء", "غرفة هورايزون — كرسي معالج أزرق داكن مع ورود صفراء"],
    },
  ];

  return (
    <section className="rooms-editorial" aria-label="غرف العلاج" ref={sectionRef}>
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
