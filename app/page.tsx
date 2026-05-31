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
import InstagramButton from "@/components/InstagramButton";

export default function Home() {
  useEffect(() => {
    // On page load, scroll to show full hero section
    // Use setTimeout to ensure DOM is fully rendered
    const scrollTimer = setTimeout(() => {
      window.scrollTo({ top: 120, behavior: "auto" });
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
      <InstagramButton />
    </>
  );
}
