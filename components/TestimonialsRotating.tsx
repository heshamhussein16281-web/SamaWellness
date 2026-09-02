/* Testimonials — Homepage, rotating with heading + stars */
"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "The 15-minute assessment made all the difference. I was matched with a therapist who truly understood what I was going through.", author: "N.R." },
  { text: "For the first time, I felt truly heard — not judged, not rushed, just heard.", author: "A.L." },
  { text: "Therapy didn't fix my life overnight, but it gave me the tools to finally start.", author: "K.W." },
];

export default function TestimonialsRotating({ customQuotes }: { customQuotes?: { text: string; author: string }[] }) {
  const activeQuotes = customQuotes || quotes;
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
          {activeQuotes.map((_, i) => (
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
