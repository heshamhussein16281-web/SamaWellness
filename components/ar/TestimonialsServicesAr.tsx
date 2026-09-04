"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "جيت مش عارف أتوقع إيه. بعد كام جلسة بس، بدأت أفهم نفسي بطرق ما كنتش أعرفها قبل كده.", author: "م.س." },
  { text: "المعالج بتاعي إداني أدوات فعلاً بستخدمها في حياتي اليومية. مكانش مجرد كلام — كان نمو عملي حقيقي.", author: "ر.ح." },
  { text: "العلاج الزوجي أنقذ علاقتنا. أخيراً اتعلمنا نسمع بعض من غير ما الموضوع يتحول لخناقة.", author: "د.أ." },
];

export default function TestimonialsServicesAr() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const q = quotes[index];

  return (
    <section className="testimonials testimonials--rotating" aria-label="آراء عملائنا">
      <div className="testimonials__single">
        <h2 className="testimonials__heading">آراء عملائنا</h2>
        <div className="testimonials__stars" aria-label="٥ من ٥ نجوم">★★★★★</div>
        <blockquote
          className={`testimonials__card ${fade ? "testimonials__card--visible" : "testimonials__card--hidden"}`}
        >
          <p className="testimonials__text">«{q.text}»</p>
          <cite className="testimonials__author">— {q.author}</cite>
        </blockquote>
        <div className="testimonials__dots">
          {quotes.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot ${i === index ? "testimonials__dot--active" : ""}`}
              onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true); }, 400); }}
              aria-label={`شهادة ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
