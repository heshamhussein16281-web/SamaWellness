/* Testimonials — Services page specific, rotating */
"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "I came in not knowing what to expect. After just a few sessions, I started understanding myself in ways I never had before.", author: "M.S." },
  { text: "My therapist gave me tools I actually use in my daily life. It wasn't just talking — it was real, practical growth.", author: "R.H." },
  { text: "Couple therapy saved our relationship. We finally learned how to listen to each other without it turning into a fight.", author: "D.A." },
];

export default function TestimonialsServices() {
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
    <section className="testimonials testimonials--rotating" aria-label="Client Testimonials">
      <div className="testimonials__single">
        <h2 className="testimonials__heading">What Our Clients Say</h2>
        <div className="testimonials__stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote
          className={`testimonials__card ${fade ? "testimonials__card--visible" : "testimonials__card--hidden"}`}
        >
          <p className="testimonials__text">&ldquo;{q.text}&rdquo;</p>
          <cite className="testimonials__author">— {q.author}</cite>
        </blockquote>
        <div className="testimonials__dots">
          {quotes.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot ${i === index ? "testimonials__dot--active" : ""}`}
              onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true); }, 400); }}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
