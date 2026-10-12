/* Testimonials — Services page specific, rotating */
"use client";

import { useState, useEffect } from "react";

const quotes = [
  { text: "Amazing and professional experience.", author: "Ahmed E." },
  { text: "Finally found a therapist who actually gets it, thanks to how carefully they match you first. Thank you, Sama Wellness.", author: "Mohammed A." },
  { text: "What I appreciated most was how private and confidential the whole experience felt. From the moment I walked in, I felt my privacy was genuinely respected.", author: "Nada N." },
  { text: "The assessment process was very professional. Sama Eissa asked the right questions and clearly understood which type of therapist would be most suitable for me. The therapist I was matched with turned out to be an excellent fit.", author: "Yousef A." },
  { text: "Exceptional service.", author: "Alaa D." },
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
