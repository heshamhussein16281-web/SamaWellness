export const dynamic = "force-dynamic";
export const revalidate = 0;

import dynamic_import from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Services = dynamic_import(() => import("@/components/Services"), { ssr: false });
const Process = dynamic_import(() => import("@/components/Process"), { ssr: false });
const Team = dynamic_import(() => import("@/components/Team"), { ssr: false });
const Contact = dynamic_import(() => import("@/components/Contact"), { ssr: false });

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />
        <Team />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
