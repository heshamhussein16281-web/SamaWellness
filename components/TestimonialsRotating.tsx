/* Testimonials — Homepage, rotating with heading + stars */
"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "From booking the appointment to meeting the therapist, everything was handled professionally. The whole experience felt very organized and personal.", author: "Yousef H." },
  { text: "The beautiful environment and top-notch therapists make this place really special. Highly recommended!", author: "Tara J." },
  { text: "It doesn't feel like a traditional medical clinic at all. It's warm, elegant, private, and very welcoming.", author: "Nada S." },
  { text: "Well organized and professional — I'd definitely recommend it to anyone seeking to self-develop and reflect.", author: "Khaled E." },
  { text: "Great experience — professional, private, and easy to book. Loved that they actually match you to a therapist instead of just assigning one.", author: "Mazen M." },
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
        <a
          href="https://www.google.com/maps/search/?api=1&query=Sama+Wellness+Therapy+Meditown+New+Giza"
          target="_blank"
          rel="noopener noreferrer"
          className="testimonials__google-link"
        >
          Read more reviews on Google
        </a>
      </div>
    </section>
  );
}
