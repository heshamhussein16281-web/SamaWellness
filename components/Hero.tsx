import { LogoMark } from "./Navbar";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen bg-linen flex flex-col pt-28">
      {/* Hero content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-8 grid md:grid-cols-2 gap-0 items-center">
        {/* Left: headline + logo */}
        <div className="flex flex-col items-start justify-center py-16">
          <p className="font-nav text-xs tracking-[0.25em] uppercase text-charcoal/50 mb-8">
            ELEVATE YOUR MENTAL WELLNESS
          </p>
          {/* Large logo in center */}
          <div className="flex flex-col items-center w-full mb-10">
            <svg width="140" height="170" viewBox="0 0 55 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="27" cy="22" rx="14" ry="17" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
              <path d="M20 38 Q27 42 34 38" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
              <rect x="22" y="40" width="10" height="5" rx="1" stroke="#7b2d3e" strokeWidth="1.5" fill="none"/>
              <line x1="27" y1="38" x2="27" y2="20" stroke="#4a6741" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M27 32 C27 32 20 30 19 24 C23 24 27 28 27 32Z" fill="#4a6741"/>
              <path d="M27 29 C27 29 34 27 35 21 C31 21 27 25 27 29Z" fill="#4a6741"/>
              <path d="M27 24 C27 24 25 18 27 14 C29 18 27 24 27 24Z" fill="#4a6741"/>
            </svg>
            <p className="font-display text-burgundy-500 text-5xl font-semibold leading-tight text-center mt-4">Sama</p>
            <p className="font-display text-burgundy-500 text-5xl font-semibold leading-tight text-center">Wellness</p>
            <p className="font-display text-burgundy-500 text-5xl font-semibold leading-tight text-center">Therapy</p>
          </div>
          <p className="font-display text-charcoal/70 text-2xl italic text-center w-full">
            Professional Care Tailored to Your Journey
          </p>
        </div>

        {/* Right: therapy room image */}
        <div className="hidden md:block h-full min-h-[600px] relative">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"
            alt="Therapy room"
            className="w-full h-full object-cover"
            style={{ maxHeight: "calc(100vh - 7rem)" }}
          />
        </div>
      </div>
    </section>
  );
}
