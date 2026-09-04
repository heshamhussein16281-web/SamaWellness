"use client";

import { useState, useEffect } from "react";

const defaultQuotes = [
  { text: "تقييم الـ١٥ دقيقة فرق معايا جداً. اتوصلت بمعالج فعلاً فاهم اللي أنا بمر بيه.", author: "ن.ر." },
  { text: "لأول مرة حسيت إن حد فعلاً سامعني — مش بيحكم عليا، مش مستعجل، بس سامعني.", author: "أ.ل." },
  { text: "العلاج مصلحش حياتي بين يوم وليلة، بس إداني الأدوات إني أبدأ أخيراً.", author: "ك.و." },
];

export default function TestimonialsRotatingAr({ customQuotes }: { customQuotes?: { text: string; author: string }[] }) {
  const activeQuotes = customQuotes || defaultQuotes;
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % activeQuotes.length);
        setFade(true);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeQuotes.length]);

  const q = activeQuotes[index];

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
          {activeQuotes.map((_, i) => (
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
