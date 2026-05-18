// Team section

const THERAPISTS = [
  {
    id: 1,
    name: "Sama Eissa",
    title: "Founder & Counseling Psychologist",
    bio: "Sama is an Individual and Couple Therapist. She attained her Master's degree in Counseling Psychology from the American University in Cairo (AUC). She has wide experience working with various age groups from adolescence to young adults, adults, and partners. Sama utilizes an eclectic approach tailored to the client's individual needs, drawing on humanistic, person-centered, CBT, REBT, and Gestalt methods.",
    specializations: ["Anxiety", "Personality Disorders", "Low Self-Esteem", "Depression", "Couple Therapy", "Inner Child", "Shadow Work"],
  },
  {
    id: 2,
    name: "Sara El Shakankiri",
    title: "Psychiatric & Counseling Psychologist",
    bio: "Sara graduated from Ain Shams University Faculty of Medicine and completed her Master's in Neuropsychiatry, plus clinical training in psychiatry at the University of Pittsburgh. She practices pharmacotherapy and psychotherapy, adopting a systemic approach that addresses individuals within their family and marital context.",
    specializations: ["Adolescent Psychiatry", "General Adult Psychiatry", "Parental & Family Counseling", "Marriage Counseling", "CBT"],
  },
  {
    id: 3,
    name: "Marina Rowes",
    title: "Counseling Psychologist",
    bio: "Marina is a Trauma-focused Counseling Psychologist holding her Bachelor's and Master's from Mesrpac Denmark School. She works with diverse clients through CBT, Internal Family Systems, DBT, and narrative therapy, also utilizing somatic techniques to help clients release emotions from their bodies.",
    specializations: ["PTSD", "Anxiety", "Depression", "Sexual Abuse", "Personality Disorders", "Eating Disorders", "Psychosomatic"],
  },
  {
    id: 4,
    name: "Alia El Meteni",
    title: "Counseling Psychologist",
    bio: "Alia earned her Bachelor's in Psychology from AUC and her Master's in Counseling Psychology from Webster University (Netherlands), and is currently pursuing her Doctorate (PsyD). She adopts an integrative approach drawing on CBT, DBT, and narrative therapy to help clients reshape thought patterns and build resilience.",
    specializations: ["Adolescents & Adults", "Mood Disorders", "Personality Disorders", "Trauma & Anxiety"],
  },
  {
    id: 5,
    name: "Mohamed Torkey",
    title: "Clinical Psychologist",
    bio: "Mohamed is a Clinical Psychologist specializing in trauma, grief and loss, and Borderline Personality Disorder. He works with adults and adolescents using Schema Therapy, CBT, and DBT. He also facilitates group support around grief, loss, and emotional regulation, and has expertise in addiction recovery.",
    specializations: ["Trauma", "Grief & Loss", "Anxiety", "Mood Disorders", "OCD", "Borderline Personality Disorder"],
  },
  {
    id: 6,
    name: "Haidy El Masry",
    title: "Counseling Psychologist",
    bio: "Haidy is a certified counsellor with a Master's in Psychotherapy from IPSICC and a specialized diploma in counseling for survivors of sexual abuse. She is also a Positive Discipline Parent Educator. Her holistic, integrative approach combines CBT, DBT, psychosomatic, and mindfulness-based methods.",
    specializations: ["Anxiety", "Depression", "Relationship Struggles", "Suicidal or Self-Harming Behavior"],
  },
  {
    id: 7,
    name: "Sandy Magdy",
    title: "Counseling Psychologist",
    bio: "Sandy is a therapist with a medical background specializing in trauma, complex PTSD, eating disorders, and personality disorders. She combines CBT, DBT, Schema Therapy, and positive psychology, believing that healing happens in connection — when individuals feel deeply seen and accepted without judgment.",
    specializations: ["Complex PTSD", "Eating Disorders", "Anxiety", "Depression", "Borderline Personality Disorder"],
  },
  {
    id: 8,
    name: "Nour Hwaidak",
    title: "Counseling Psychologist",
    bio: "Nour is a Jungian Oriented Psychotherapist with an MA from the University of Cincinnati and a PhD candidate at Pacifica Graduate Institute. She is a Licensed Professional Counselor (LPC) and National Certified Counselor (NCC). She approaches psychotherapy from a psychodynamic, psychoanalytic model, working with the client's unconscious.",
    specializations: ["Complex Trauma", "Social Anxiety", "Generalized Anxiety", "Depression", "Grief", "Self-Image Issues"],
  },
];

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80",
  "https://images.unsplash.com/photo-1494790108755-2616b612b5be?w=600&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
  "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=600&q=80",
  "https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?w=600&q=80",
];

function TherapistCard({ therapist, photoIndex }) {
  const [expanded, setExpanded] = React.useState(false);
  const firstSentenceEnd = therapist.bio.indexOf(". ") + 1;
  const bioPreview = firstSentenceEnd > 1 ? therapist.bio.slice(0, firstSentenceEnd) : therapist.bio;
  const bioRest = firstSentenceEnd > 1 ? therapist.bio.slice(firstSentenceEnd).trim() : "";
  const hasBioRest = bioRest.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="img-zoom" style={{ aspectRatio: "3/4", marginBottom: "16px" }}>
        <img
          src={FALLBACK_PHOTOS[photoIndex]}
          alt={therapist.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <p style={{
        fontFamily: "var(--font-display)",
        fontSize: "18px",
        fontWeight: 400,
        color: "rgb(45, 74, 70)",
        margin: "0 0 2px",
        lineHeight: 1.2,
      }}>{therapist.name}</p>

      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "12px",
        fontWeight: 300,
        color: "rgba(44,44,44,0.55)",
        margin: "0 0 12px",
        lineHeight: 1.4,
      }}>{therapist.title}</p>

      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        fontWeight: 300,
        color: "rgba(44,44,44,0.7)",
        lineHeight: 1.75,
        margin: "0 0 6px",
      }}>
        {bioPreview}
        {expanded && ` ${bioRest}`}
      </p>

      {hasBioRest && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontFamily: "var(--font-ui)",
            fontSize: "11px",
            fontWeight: 300,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgb(45, 74, 70)",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            textAlign: "left",
            marginBottom: "16px",
            alignSelf: "flex-start",
          }}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}

      <div style={{ marginTop: "auto", paddingTop: "8px" }}>
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "10px",
          fontWeight: 300,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(44,44,44,0.4)",
          margin: "0 0 8px",
        }}>Specialized In</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {therapist.specializations.map((s) => (
            <span
              key={s}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "11px",
                fontWeight: 300,
                color: "#7b2d3e",
                border: "1px solid rgba(123,45,62,0.3)",
                padding: "2px 8px",
                lineHeight: 1.5,
              }}
            >{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Team() {
  return (
    <section id="team" style={{ backgroundColor: "#F5F2EE", borderTop: "1px solid rgb(234,228,221)", padding: "80px 0" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 64px" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(28px, 3vw, 52px)",
          fontWeight: 400,
          color: "rgb(45, 74, 70)",
          textAlign: "center",
          marginTop: 0,
          marginBottom: "64px",
          lineHeight: 1.2,
        }}>The Team Dedicated to Your Wellness</h2>

        <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px", marginBottom: "64px" }}>
          {THERAPISTS.slice(0, 4).map((t, i) => (
            <TherapistCard key={t.id} therapist={t} photoIndex={i} />
          ))}
        </div>

        <div style={{ width: "100%", height: "1px", backgroundColor: "rgb(234,228,221)", marginBottom: "64px" }} />

        <div className="team-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px" }}>
          {THERAPISTS.slice(4, 8).map((t, i) => (
            <TherapistCard key={t.id} therapist={t} photoIndex={i + 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Team });
