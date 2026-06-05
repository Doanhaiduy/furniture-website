"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { RemoteImage } from "./remote-image";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  meta: string;
};

export function HeroShowcase({
  slides,
  pauseLabel,
  playLabel,
}: {
  slides: HeroSlide[];
  pauseLabel: string;
  playLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  const slideCount = slides.length;
  const activeSlide = slides[active] ?? slides[0];
  const previousIndex = slideCount > 0 ? (active - 1 + slideCount) % slideCount : 0;
  const nextIndex = slideCount > 0 ? (active + 1) % slideCount : 0;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReduceMotion(query.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || slideCount < 2) return;
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % slideCount);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, slideCount]);

  if (!activeSlide) return null;

  const goPrevious = () => setActive((index) => (index - 1 + slideCount) % slideCount);
  const goNext = () => setActive((index) => (index + 1) % slideCount);

  const getSlideClass = (index: number) => {
    if (index === active) {
      return "z-30 left-1/2 h-full w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100 md:w-[min(1180px,70vw)]";
    }

    if (index === previousIndex) {
      return "left-0 z-10 hidden h-[82%] w-[30vw] -translate-x-[58%] -translate-y-1/2 scale-[0.9] opacity-62 md:block";
    }

    if (index === nextIndex) {
      return "right-0 z-10 hidden h-[82%] w-[30vw] translate-x-[58%] -translate-y-1/2 scale-[0.9] opacity-62 md:block";
    }

    return "pointer-events-none left-1/2 z-0 h-full w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 scale-95 opacity-0";
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#f7f5f1] py-5 text-white md:py-8">
      <h1 className="sr-only">{activeSlide.title}</h1>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.96)_0%,rgba(247,245,241,0.92)_45%,rgba(229,224,216,0.9)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#f7f5f1] to-transparent md:w-44" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#f7f5f1] to-transparent md:w-44" />

      <div
        className="relative mx-auto h-[min(70svh,620px)] min-h-[390px] max-w-[1720px] md:h-[calc(100svh-10.5rem)] md:min-h-[520px] md:max-h-[760px]"
        aria-roledescription="carousel"
        aria-label={activeSlide.eyebrow}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            aria-hidden={active !== index}
            className={`absolute top-1/2 overflow-hidden bg-primary shadow-[0_32px_90px_rgba(38,49,45,0.22)] transition-all duration-700 ease-[var(--ease-premium)] motion-reduce:transition-none ${getSlideClass(index)}`}
          >
            <RemoteImage
              src={slide.image}
              alt=""
              className={`h-full w-full object-cover transition-transform duration-[5200ms] ease-[var(--ease-premium)] motion-reduce:transition-none ${
                active === index && !paused ? "scale-[1.035]" : "scale-100"
              }`}
              priority={index < 3}
              sizes={index === active ? "(min-width: 1024px) 70vw, 100vw" : "30vw"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/7 to-black/12" />
          </div>
        ))}

        <button
          type="button"
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-40 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-black/22 text-white shadow-[0_14px_36px_rgba(0,0,0,0.18)] backdrop-blur transition hover:bg-black/36 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 md:left-[max(1rem,calc(50%-620px))]"
          onClick={goPrevious}
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-40 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-black/22 text-white shadow-[0_14px_36px_rgba(0,0,0,0.18)] backdrop-blur transition hover:bg-black/36 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 md:right-[max(1rem,calc(50%-620px))]"
          onClick={goNext}
        >
          <ChevronRight className="size-6" />
        </button>

        <div className="absolute bottom-5 left-1/2 z-40 flex w-[calc(100%-2.5rem)] max-w-[1180px] -translate-x-1/2 justify-end">
          <div className="flex items-center gap-2 rounded-full border border-white/18 bg-black/20 px-3 py-2 shadow-[0_18px_44px_rgba(0,0,0,0.14)] backdrop-blur-md">
            <div className="flex gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={slide.title}
                  aria-current={active === index}
                  className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 ${
                    active === index ? "w-9 bg-white" : "w-5 bg-white/42 hover:bg-white/65"
                  }`}
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full border border-white/18 text-white/78 transition hover:border-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              aria-label={paused ? playLabel : pauseLabel}
              aria-pressed={paused}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
