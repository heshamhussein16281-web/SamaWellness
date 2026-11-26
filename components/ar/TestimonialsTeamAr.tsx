"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "المعالجة بتاعتي مكانتش بس بتسمع — ساعدتني أشوف أنماط كنت عمياني عنها لسنين.", author: "س.أ." },
  { text: "اتوصلت بحد فعلاً فاهم ثقافتي وخلفيتي. ده فرق كتير.", author: "ل.ك." },
  { text: "الفريق هنا استثنائي. محترف، دافئ، وملتزم بشغله بعمق.", author: "ن.م." },
];

export default function TestimonialsTeamAr() {
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

  return (
    <section className="testimonials testimonials--rotating" aria-label="آراء عملائنا">
      <div className="testimonials__single">
        <h2 className="testimonials__heading">آراء عملائنا</h2>
        <div className="testimonials__stars" aria-label="٥ من ٥ نجوم">★★★★★</div>
        <div className="testimonials__card-stack">
          {quotes.map((q, i) => (
            <blockquote
              key={i}
              className={`testimonials__card ${i === index && fade ? "testimonials__card--visible" : "testimonials__card--hidden"}`}
              aria-hidden={i === index ? undefined : true}
            >
              <p className="testimonials__text">«{q.text}»</p>
              <cite className="testimonials__author">— {q.author}</cite>
            </blockquote>
          ))}
        </div>
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
