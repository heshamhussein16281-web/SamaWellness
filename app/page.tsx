"use client";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Team from "@/components/Team";
import RoomsEnvironment from "@/components/RoomsEnvironment";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  useEffect(() => {
    // On page load, scroll to show full hero section
    // Use setTimeout to ensure DOM is fully rendered
    const scrollTimer = setTimeout(() => {
      // Adjust scroll position based on viewport: desktop 120px, mobile 60px
      const scrollTop = window.innerWidth > 768 ? 120 : 60;
      window.scrollTo({ top: scrollTop, behavior: "auto" });
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />
        <Team />
        <RoomsEnvironment />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
