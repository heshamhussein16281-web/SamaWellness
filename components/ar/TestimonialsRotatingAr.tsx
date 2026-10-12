"use client";

import { useState, useEffect } from "react";

const defaultQuotes = [
  { text: "من حجز الموعد لحد ما قابلت المعالجة، كل حاجة كانت محترفة. الموضوع كله كان منظم وحسيت إنه شخصي فعلاً.", author: "ي.ح." },
  { text: "البيئة الجميلة والمعالجين المتميزين بيخلوا المكان ده فعلاً مختلف. بوصي بيه بشدة!", author: "ت.ج." },
  { text: "المكان مش حاسس إنه عيادة طبية تقليدية خالص. دافي، أنيق، خاص، ومرحب جداً ❤️", author: "ن.ش." },
  { text: "منظم ومحترف جداً، هرشحه فعلاً لأي حد عايز يطور نفسه ويراجع ذاته.", author: "خ.ا." },
  { text: "تجربة جميلة — محترفة وخاصة وسهلة الحجز. عجبني إنهم فعلاً بيدوروا على المعالج المناسب ليك مش بس بيحطوا حد عشوائي.", author: "م.م." },
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
        <a
          href="https://www.google.com/maps/search/?api=1&query=Sama+Wellness+Therapy+Meditown+New+Giza"
          target="_blank"
          rel="noopener noreferrer"
          className="testimonials__google-link"
        >
          اقرأ تقييمات أكتر على جوجل
        </a>
      </div>
    </section>
  );
}
