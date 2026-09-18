"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  { src: "/slides/slide1.jpg", alt: "Fair Weights. Fair Trade. — MaapSetu" },
  { src: "/slides/slide2.jpg", alt: "Verify Your Instrument — MaapSetu" },
  { src: "/slides/slide3.jpg", alt: "Consumer Protection Act — Know Your Rights" },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, paused]);

  return (
    <div
      className="relative w-full overflow-hidden bg-[#051229]"
      style={{ aspectRatio: "16/5.2" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover object-center"
            priority={i === 0}
            sizes="100vw"
          />
        </div>
      ))}

      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === current ? "1.75rem" : "0.5rem",
              background: i === current ? "#ff9933" : "rgba(255,255,255,0.55)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
