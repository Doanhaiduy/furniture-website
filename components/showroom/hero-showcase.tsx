"use client";

import Link from "next/link";
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

export type HeroGroupLink = {
  href: string;
  image: string;
  title: string;
  summary: string;
  ctaLabel: string;
};

export function HeroShowcase({
  slides,
  groups = [],
  pauseLabel,
  playLabel,
}: {
  slides: HeroSlide[];
  groups?: HeroGroupLink[];
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
    <section className="public-hero relative isolate overflow-hidden text-white">
      <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-surface-page to-transparent md:w-44" />
      <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-surface-page to-transparent md:w-44" />

      <div
        className="public-hero-stage relative mx-auto max-w-[1720px]"
        aria-roledescription="carousel"
        aria-label={activeSlide.eyebrow}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            aria-hidden={active !== index}
            className={`public-hero-slide absolute top-1/2 overflow-hidden transition-all duration-700 ease-[var(--ease-premium)] motion-reduce:transition-none ${getSlideClass(index)}`}
          >
            <RemoteImage
              src={slide.image}
              alt=""
              className={`h-full w-full object-cover transition-transform duration-[5200ms] ease-[var(--ease-premium)] motion-reduce:transition-none ${
                active === index && !paused ? "scale-[1.035]" : "scale-100"
              }`}
              priority={index === 0}
              sizes={index === active ? "(min-width: 1024px) 70vw, 100vw" : "30vw"}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/62 via-black/20 to-black/24" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/16" />
          </div>
        ))}

        <button
          type="button"
          aria-label="Previous slide"
          className="public-hero-control cursor-pointer absolute left-4 right-auto top-1/2 z-50 -translate-y-1/2 md:left-8"
          onClick={goPrevious}
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className="public-hero-control cursor-pointer absolute right-4 left-auto top-1/2 z-50 -translate-y-1/2 md:right-8"
          onClick={goNext}
        >
          <ChevronRight className="size-6" />
        </button>

        <div className="absolute right-4 top-4 z-50 md:right-[max(1rem,calc(50%-590px))]">
          <div className="public-hero-dots flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  aria-label={slide.title}
                  aria-current={active === index}
                  className="public-hero-dot cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55"
                  onClick={() => setActive(index)}
                />
              ))}
            </div>
            <button
              type="button"
              className="cursor-pointer inline-flex size-8 items-center justify-center rounded-full border border-white/18 text-white/78 transition hover:border-white/45 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              aria-label={paused ? playLabel : pauseLabel}
              aria-pressed={paused}
              onClick={() => setPaused((value) => !value)}
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-40">
          <div className="container-pd flex h-full items-center justify-center pb-16 pt-20 md:pb-20">
            <div className="mx-auto max-w-5xl text-center">
              <p className="label-pd text-white/74">{activeSlide.eyebrow}</p>
              <h1 className="type-hero-title mx-auto mt-4 max-w-4xl drop-shadow-[0_18px_34px_rgba(0,0,0,0.28)]">
                {activeSlide.title}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/82 md:text-lg md:leading-8">
                {activeSlide.lead}
              </p>
              {groups.length > 0 ? (
                <div className="pointer-events-auto mt-7 flex flex-wrap justify-center gap-2">
                  {groups.map((group) => (
                    <Link key={group.href} href={group.href} className="public-hero-group-link group">
                      <span>{group.title}</span>
                      <ChevronRight className="size-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
