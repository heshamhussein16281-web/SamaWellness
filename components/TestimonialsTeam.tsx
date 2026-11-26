/* Testimonials — Team page specific, rotating */
"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "My therapist didn't just listen — she helped me see patterns I'd been blind to for years.", author: "S.A." },
  { text: "I was matched with someone who genuinely understood my culture and background. That made all the difference.", author: "L.K." },
  { text: "The team here is exceptional. Professional, warm, and deeply committed to their work.", author: "N.M." },
];

export default function TestimonialsTeam() {
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
    <section className="testimonials testimonials--rotating" aria-label="Client Testimonials">
      <div className="testimonials__single">
        <h2 className="testimonials__heading">What Our Clients Say</h2>
        <div className="testimonials__stars" aria-label="5 out of 5 stars">★★★★★</div>
        <div className="testimonials__card-stack">
          {quotes.map((q, i) => (
            <blockquote
              key={i}
              className={`testimonials__card ${i === index && fade ? "testimonials__card--visible" : "testimonials__card--hidden"}`}
              aria-hidden={i === index ? undefined : true}
            >
              <p className="testimonials__text">&ldquo;{q.text}&rdquo;</p>
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
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
