import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="bg-linen">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2">
        {/* Left: large logo + tagline */}
        <div className="flex flex-col justify-center items-center py-20 px-12">
          <p className="font-nav text-xs tracking-[0.3em] uppercase text-charcoal/50 mb-10 self-start">
            ELEVATE YOUR MENTAL WELLNESS
          </p>
          <Image
            src="/logo.png"
            alt="Sama Wellness Therapy"
            width={340}
            height={340}
            className="object-contain"
            priority
          />
          <p className="font-display text-charcoal/60 text-2xl italic text-center mt-8">
            Professional Care Tailored to Your Journey
          </p>
        </div>

        {/* Right: therapy room image — full height of section */}
        <div className="hidden md:block">
          <img
            src="/room.jpg"
            alt="Sama Wellness Therapy room"
            className="w-full h-full object-cover"
            style={{ minHeight: "600px" }}
          />
        </div>
      </div>
    </section>
  );
}
