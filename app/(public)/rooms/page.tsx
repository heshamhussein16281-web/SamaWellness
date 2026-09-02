/* Rooms Page — Locked Variant A (Editorial Story)
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import PageHero from "@/components/PageHero";
import ScrollReveal from "@/components/ScrollReveal";
import RoomsGalleryIntro from "@/components/RoomsGalleryIntro";
import RoomsEditorial from "@/components/RoomsEditorial";
import RoomsValues from "@/components/RoomsValues";
import TestimonialsRotating from "@/components/TestimonialsRotating";
import FinalCTA from "@/components/FinalCTA";

const roomTestimonials = [
  { text: "The moment I walked in, I felt at ease. The space itself is part of the healing.", author: "L.M." },
  { text: "It doesn’t feel like a clinic — it feels like somewhere safe. That made all the difference.", author: "R.K." },
  { text: "I was nervous about my first session, but the warm, calm environment helped me open up.", author: "S.A." },
];

export default function RoomsPage() {
  return (
    <>
      <PageHero eyebrow="Our Spaces" title="The Therapy Rooms" />
      <ScrollReveal>
        <RoomsGalleryIntro />
      </ScrollReveal>
      <ScrollReveal>
        <RoomsEditorial />
      </ScrollReveal>
      <ScrollReveal>
        <RoomsValues />
      </ScrollReveal>
      <ScrollReveal>
        <TestimonialsRotating customQuotes={roomTestimonials} />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}
