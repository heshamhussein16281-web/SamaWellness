"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "تجربة رائعة ومحترفة جداً.", author: "أ.ا." },
  { text: "أخيراً لقيت معالج فعلاً فاهمني، وده بسبب دقة عملية الاختيار قبل كده. شكراً ساما ويلنس.", author: "م.ع." },
  { text: "أكتر حاجة قدرتها هي الخصوصية والسرية في كل التجربة. من أول لحظة دخلت حسيت إن خصوصيتي محترمة فعلاً.", author: "ن.ن." },
  { text: "عملية التقييم كانت محترفة جداً. سما عيسى سألت الأسئلة الصحيحة وفهمت بسرعة نوع المعالج المناسب ليا. المعالجة اللي اختارتها لي كانت فعلاً مناسبة جداً.", author: "ي.ع." },
  { text: "خدمة استثنائية.", author: "آ.د." },
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
