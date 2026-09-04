"use client";

const steps = [
  {
    image: "/initial-form.jpg",
    title: "استمارة الفحص الأولي",
  },
  {
    image: "/assessment.jpg",
    title: "تقييم ١٥ دقيقة مع الكاونسلر سما",
  },
  {
    image: "/matched-therapist.jpg",
    title: "المعالج المناسب ليك",
  },
];

export default function ProcessAr() {
  return (
    <section id="process" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "96px 0", minHeight: "calc(100vh - var(--navbar-height))", boxSizing: "border-box" }}>
      <div className="process-inner" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>

        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(30px, 3.2vw, 52px)",
          fontWeight: 400,
          color: "rgb(45, 74, 70)",
          textAlign: "center",
          margin: "0 0 72px 0",
          letterSpacing: "0.01em",
          lineHeight: 1.2,
        }}>
          عملية الاختيار ببساطة
        </h2>

        <div className="process-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ backgroundColor: "#EAE4DD", padding: "40px clamp(20px, 8vw, 55px)", marginBottom: "32px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.title}
                  style={{ width: "171px", height: "171px", objectFit: "contain", display: "block" }}
                />
              </div>
              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 2.2vw, 37px)",
                fontWeight: 400,
                color: "rgb(45, 74, 70)",
                lineHeight: 1.25,
                marginBottom: "0",
              }}>
                {s.title}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
