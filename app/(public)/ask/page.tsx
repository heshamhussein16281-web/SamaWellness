/* Ask Sama + FAQ Page — Locked Variant B (centered intro)
   Navbar + Footer + ContactButton provided by (public)/layout.tsx */
import type { Metadata } from "next";
import Script from "next/script";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "FAQ & Ask Counselor Sama | Sama Wellness Therapy",
  description: "Answers to common therapy questions — from assessments to confidentiality. Ask Counselor Sama directly at Sama Wellness Therapy, New Giza.",
  alternates: {
    canonical: "/ask",
    languages: { en: "/ask", ar: "/ar/ask", "x-default": "/ask" },
  },
  openGraph: {
    title: "FAQ & Ask Counselor Sama | Sama Wellness Therapy",
    description: "Find answers to common therapy questions and ask Counselor Sama directly at Sama Wellness Therapy in New Giza, Cairo.",
    url: "https://www.samawellnesstherapy.com/ask",
  },
};
import ScrollReveal from "@/components/ScrollReveal";
import AskSamaGalleryIntro from "@/components/AskSamaGalleryIntro";
import FAQAccordion from "@/components/FAQAccordion";
import AskCounselorSama from "@/components/AskCounselorSama";
import FinalCTA from "@/components/FinalCTA";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I know if I need therapy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you're feeling stuck, overwhelmed, anxious, struggling in your relationships, or simply not functioning at your best — therapy can help. You don't need to be in crisis. Many of our clients come because they want to understand themselves better, navigate a life transition, or break patterns that no longer serve them. If you're asking this question, that curiosity alone is a good sign you'd benefit.",
      },
    },
    {
      "@type": "Question",
      name: 'Is therapy only for people in crisis, or can I come even if I\'m "just not feeling like myself"?',
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely — you don't need a diagnosis or a crisis to start therapy. Many of our clients come in saying exactly that: \"I'm not sure what's wrong, I just don't feel like myself.\" That's more than enough reason. Therapy is a space to explore what's weighing on you before it becomes something bigger. Early support often leads to faster, deeper progress.",
      },
    },
    {
      "@type": "Question",
      name: "I've never been to therapy before — what should I expect?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your journey begins with a free 15-minute assessment call with Counselor Sama, who will listen to what you're going through and personally match you with the therapist best suited to your needs. Your first session is a chance to share your story at your own pace — there's no pressure to dive deep right away. Your therapist will guide the conversation, help you feel comfortable, and together you'll start shaping a path forward.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between talking to a therapist and talking to a trusted friend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Friends care about you, but a therapist is trained to listen without judgment, identify patterns you might not see, and guide you toward real change using evidence-based techniques. Therapy is a confidential, structured space that's entirely about you — no obligations, no reciprocity, no worrying about burdening someone. It's support with direction.",
      },
    },
    {
      "@type": "Question",
      name: "How do I know which type of therapy is right for me — individual, couples, or teen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "That's exactly what the free assessment call is for. Counselor Sama will talk with you about what you're experiencing and recommend the best approach — whether that's individual sessions for personal growth, couples therapy to strengthen your relationship, or teen therapy tailored to younger clients. You don't need to figure it out alone.",
      },
    },
    {
      "@type": "Question",
      name: "How do you match me with the right therapist?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Counselor Sama conducts every assessment herself. She considers your specific concerns, personality, therapy goals, and preferences — then matches you with one of our nine licensed therapists based on their specializations and approach. This personal matching process is one of the things our clients value most — it means you're not randomly assigned; you're thoughtfully paired.",
      },
    },
    {
      "@type": "Question",
      name: "Can I request a specific therapist, or switch if the fit isn't right?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes to both. If you have a preference, let us know during your assessment call. And if after starting sessions you feel the connection isn't quite right, we'll help you transition to another therapist — no awkwardness, no questions asked. The right therapeutic relationship is essential, and we want you to feel completely comfortable.",
      },
    },
    {
      "@type": "Question",
      name: "Do you have English-speaking therapists?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Our team includes English-speaking therapists, and we can match you with one based on your language preference. Let us know during your assessment call.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to prepare anything before my first session?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No preparation is needed — just come as you are. Some clients find it helpful to think about what they'd like to discuss or what they hope to get from therapy, but there's no homework. Your therapist will guide the conversation and meet you where you are.",
      },
    },
    {
      "@type": "Question",
      name: "What happens during the first session?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your first session is about getting to know each other. Your therapist will ask about your background, what brought you to therapy, and what you'd like to work on. It's a safe, unhurried conversation — you share only what you're comfortable with. By the end, you'll have a clearer sense of your goals and how you'll work together going forward.",
      },
    },
    {
      "@type": "Question",
      name: "How long will I need to be in therapy? How many sessions does it take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your goals and what you're working through. Some clients find clarity in 6–8 sessions; others benefit from longer-term support. There's no fixed commitment — you and your therapist will regularly check in on your progress and adjust as needed. You're always in control of how long you continue.",
      },
    },
    {
      "@type": "Question",
      name: "How often will I meet with my therapist?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most clients start with weekly sessions to build momentum and establish a strong therapeutic relationship. As you progress, you and your therapist may decide to move to biweekly or monthly sessions. The pace is always tailored to what works best for you.",
      },
    },
    {
      "@type": "Question",
      name: "How do I know if therapy is actually working?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Progress in therapy can be subtle at first — you might notice you're reacting differently to situations, sleeping better, feeling lighter, or communicating more openly. Your therapist will check in regularly about how you're feeling and whether the approach is working. If something isn't clicking, we adjust. Real change often shows up in your daily life before you fully recognize it in session.",
      },
    },
    {
      "@type": "Question",
      name: "What therapy approaches do your therapists use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our therapists are trained in a range of evidence-based approaches including Cognitive Behavioral Therapy (CBT), psychodynamic therapy, emotion-focused therapy, and more. The approach used depends on your needs and goals — your therapist will explain their recommended approach and why it's suited to you. We believe in tailoring the method to the person, not the other way around.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer in-person sessions, online sessions, or both?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We offer in-person sessions at our clinic.",
      },
    },
    {
      "@type": "Question",
      name: "Do you offer evening or weekend appointments?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — we understand that life doesn't pause for therapy. We offer flexible scheduling including evening slots to fit around your work and personal commitments. Availability varies by therapist, so let us know what works best for you when booking.",
      },
    },
    {
      "@type": "Question",
      name: "How do I book or reschedule a session?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book or reschedule by contacting us via WhatsApp. Our team will help you find a time that works. We aim to make scheduling as simple and stress-free as possible.",
      },
    },
    {
      "@type": "Question",
      name: "What is your cancellation policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We ask for at least 24 hours' notice if you need to cancel or reschedule. This allows us to offer the slot to another client who may be waiting. Late cancellations or no-shows are subject to the full fee.",
      },
    },
    {
      "@type": "Question",
      name: "What do your therapy rooms look like — are they private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our therapy rooms are designed to feel warm, calming, and completely private. Each room is a quiet, comfortable space where you can speak freely without concern. We've intentionally created an environment that feels nothing like a clinical setting — because healing happens best when you feel at ease.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a session cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Session fees vary depending on the type of therapy (individual, couples, or teen). You'll receive full pricing details during your free assessment call. We believe in transparency — there are no surprises.",
      },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We accept cash, bank transfer, and Instapay. Payment details are confirmed when you book your session.",
      },
    },
    {
      "@type": "Question",
      name: "Are there any hidden fees beyond the session rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The session rate is the session rate. Your free assessment call is exactly that — free. We don't charge for matching, admin, or any other hidden extras.",
      },
    },
    {
      "@type": "Question",
      name: "Is everything I share in therapy kept confidential?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Confidentiality is a cornerstone of our practice. What you share in your sessions stays between you and your therapist. We take your privacy seriously — it's essential to building the trust that makes therapy work.",
      },
    },
    {
      "@type": "Question",
      name: "Will my family, partner, or employer ever find out I'm in therapy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. We do not share any information about your attendance or what's discussed in therapy with anyone — not your family, partner, or employer — without your explicit written consent. Your therapy is your private space.",
      },
    },
    {
      "@type": "Question",
      name: "What are the exceptions to confidentiality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There are very limited, legally required exceptions. Your therapist is obligated to act if there is an immediate risk of harm to you or someone else, or in cases involving the abuse or neglect of a child or vulnerable person. These situations are rare, and your therapist will always explain the process if such a situation arises. Outside of these circumstances, everything remains fully confidential.",
      },
    },
    {
      "@type": "Question",
      name: "Can couples therapy work if only one partner is willing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's most effective when both partners participate, but it can still begin with one. Sometimes one partner starting therapy opens the door for the other to join later. Alternatively, individual therapy can help you work through relationship challenges on your own terms. Counselor Sama can advise on the best path during your assessment call.",
      },
    },
    {
      "@type": "Question",
      name: "How does teen therapy work, and how involved will I as a parent be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Teen therapy is tailored to be age-appropriate and engaging. Your teen's sessions are their private space — but we keep you in the loop. Typically, the therapist will have an initial conversation with you to understand the context, and will share general progress updates with your consent and your teen's comfort. The goal is to support your teen while respecting their growing need for autonomy. The balance of involvement is something we discuss together.",
      },
    },
  ],
};

export default function AskPage() {
  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHero eyebrow="Get Answers" title="Your Questions, Answered" />
      <ScrollReveal>
        <AskSamaGalleryIntro />
      </ScrollReveal>
      <ScrollReveal>
        <FAQAccordion />
      </ScrollReveal>
      <ScrollReveal>
        <AskCounselorSama />
      </ScrollReveal>
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </>
  );
}
