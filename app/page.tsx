import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Process from "@/components/Process";
import Team from "@/components/Team";
import ClinicEnvironment from "@/components/ClinicEnvironment";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstagramButton from "@/components/InstagramButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />
        <Team />
        <ClinicEnvironment />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <InstagramButton />
    </>
  );
}
