"use client";

import Link from "next/link";
import { useRef } from "react";

const heroVideoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4";

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12S9.8 18.6 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function animateVideoOpacity(video: HTMLVideoElement, to: number, duration = 500) {
  const from = Number(video.style.opacity || 0);
  const start = performance.now();

  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    video.style.opacity = String(from + (to - from) * progress);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFadingOutRef = useRef(false);

  function fadeIn() {
    const video = videoRef.current;
    if (!video) return;
    isFadingOutRef.current = false;
    void video.play();
    animateVideoOpacity(video, 1);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || isFadingOutRef.current || !Number.isFinite(video.duration)) return;
    if (video.duration - video.currentTime <= 0.55) {
      isFadingOutRef.current = true;
      animateVideoOpacity(video, 0);
    }
  }

  function handleEnded() {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = "0";
    window.setTimeout(() => {
      video.currentTime = 0;
      void video.play();
      fadeIn();
    }, 100);
  }

  return (
    <section className="relative flex min-h-[calc(100vh-65px)] flex-col overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        src={heroVideoUrl}
        muted
        autoPlay
        playsInline
        preload="auto"
        onCanPlay={fadeIn}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ opacity: 0 }}
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/45 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-12 text-center md:-translate-y-[8%]">
        <div className="liquid-glass mb-8 flex items-center gap-3 rounded-full px-5 py-3 text-white/85">
          <GlobeIcon className="h-5 w-5" />
          <span className="text-sm font-medium">PAU Match Catalunya</span>
        </div>

        <h1
          className="whitespace-nowrap text-5xl tracking-tight text-white sm:text-6xl md:text-8xl lg:text-9xl"
          style={{ fontFamily: '"Instrument Serif", serif' }}
        >
          Tria-ho i entén-ho <em className="italic">tot</em>
        </h1>

        <p className="mt-6 max-w-2xl px-4 text-sm leading-relaxed text-white/80 md:text-base">
          Un recomanador explicable per comparar graus universitaris a Catalunya segons interessos, PAU, nota estimada,
          ubicació i preferències personals.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/profile"
            className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            Crear el meu perfil
          </Link>
          <Link
            href="/admin/import"
            className="liquid-glass rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Veure dades i pesos
          </Link>
        </div>
      </div>
    </section>
  );
}
