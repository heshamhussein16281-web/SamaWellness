"use client";
import { useState } from "react";

const spaces = [
  {
    id: "serenity",
    name: "Serenity",
    description: "A peaceful sanctuary for individual therapy, designed for comfort and reflection.",
    photos: [
      "clinic-serenity-1.jpg",
      "clinic-serenity-2.jpg",
      "clinic-serenity-3.jpg",
      "clinic-serenity-4.jpg",
    ],
  },
  {
    id: "horizon",
    name: "Horizon",
    description: "Our warm consultation space where therapy begins—a welcoming room for connection.",
    photos: [
      "clinic-horizon-1.jpg",
      "clinic-horizon-2.jpg",
      "clinic-horizon-3.jpg",
    ],
  },
  {
    id: "reception",
    name: "Welcoming Reception",
    description: "Step into a calm, professional environment where your healing journey starts.",
    photos: [
      "clinic-reception-1.jpg",
      "clinic-reception-2.jpg",
    ],
  },
];

export default function ClinicEnvironment() {
  const [activeIndex, setActiveIndex] = useState<Record<string, number>>({
    serenity: 0,
    horizon: 0,
    reception: 0,
  });

  const handlePrev = (id: string, totalPhotos: number) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: prev[id] === 0 ? totalPhotos - 1 : prev[id] - 1,
    }));
  };

  const handleNext = (id: string, totalPhotos: number) => {
    setActiveIndex((prev) => ({
      ...prev,
      [id]: prev[id] === totalPhotos - 1 ? 0 : prev[id] + 1,
    }));
  };

  return (
    <section id="clinic-environment" className="clinic-section">
      <div className="clinic-inner">
        <div className="clinic-header">
          <h2 className="clinic-heading">Where Wellness Happens</h2>
          <p className="clinic-subtext">
            A space designed for healing, comfort, and professional care
          </p>
        </div>

        <div className="clinic-grid">
          {spaces.map((space) => {
            const currentPhotoIndex = activeIndex[space.id] || 0;
            const totalPhotos = space.photos.length;

            return (
              <article key={space.id} className="clinic-card">
                <div className="clinic-carousel-container">
                  <div className="clinic-image-container">
                    <img
                      src={`${space.photos[currentPhotoIndex]}?v=${Date.now()}`}
                      alt={`${space.name} - View ${currentPhotoIndex + 1}`}
                      className="clinic-image"
                    />
                    <div className="clinic-overlay"></div>
                  </div>

                  {/* Navigation Buttons */}
                  {totalPhotos > 1 && (
                    <>
                      <button
                        className="clinic-carousel-btn clinic-carousel-btn--prev"
                        onClick={() => handlePrev(space.id, totalPhotos)}
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>
                      <button
                        className="clinic-carousel-btn clinic-carousel-btn--next"
                        onClick={() => handleNext(space.id, totalPhotos)}
                        aria-label="Next photo"
                      >
                        ›
                      </button>

                      {/* Dot Indicators */}
                      <div className="clinic-carousel-dots">
                        {space.photos.map((_, idx) => (
                          <button
                            key={idx}
                            className={`clinic-dot ${
                              idx === currentPhotoIndex ? "clinic-dot--active" : ""
                            }`}
                            onClick={() => setActiveIndex((prev) => ({ ...prev, [space.id]: idx }))}
                            aria-label={`View photo ${idx + 1}`}
                          />
                        ))}
                      </div>

                      {/* Photo Counter */}
                      <div className="clinic-photo-counter">
                        {currentPhotoIndex + 1} / {totalPhotos}
                      </div>
                    </>
                  )}
                </div>

                <div className="clinic-content">
                  <h3 className="clinic-room-name">{space.name}</h3>
                  <p className="clinic-room-description">{space.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
