import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen bg-linen flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full px-8 grid md:grid-cols-2 gap-0 items-stretch pt-20">
        {/* Left: large logo + tagline */}
        <div className="flex flex-col justify-center items-center py-20 pr-8">
          <p className="font-nav text-xs tracking-[0.3em] uppercase text-charcoal/50 mb-10 self-start">
            ELEVATE YOUR MENTAL WELLNESS
          </p>
          <Image
            src="/logo.png"
            alt="Sama Wellness Therapy"
            width={380}
            height={380}
            className="object-contain"
            priority
          />
          <p className="font-display text-charcoal/60 text-2xl italic text-center mt-8">
            Professional Care Tailored to Your Journey
          </p>
        </div>

        {/* Right: therapy room image — full height */}
        <div className="hidden md:block relative min-h-[600px]">
          <img
            src="/room.jpg"
            alt="Sama Wellness Therapy room"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
