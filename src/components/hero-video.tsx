"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./icon";

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleRef = useRef<(() => void) | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const hero = video?.closest(".hero");
    if (!video || !hero || !("IntersectionObserver" in window)) return;
    const mobile = window.matchMedia("(max-width: 750px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let choice: "auto" | "play" | "pause" = "auto";
    let visible = false;
    let disposed = false;
    let failed = false;
    let request = 0;

    const automaticPlaybackAllowed = () =>
      !reducedMotion.matches &&
      !connection?.saveData &&
      !["slow-2g", "2g"].includes(connection?.effectiveType || "");
    const wantsPlayback = () =>
      choice === "play" || (choice === "auto" && automaticPlaybackAllowed());

    async function syncPlayback() {
      if (!video || disposed) return;
      const currentRequest = ++request;
      if (!wantsPlayback() || !visible || document.hidden || failed) {
        video.pause();
        // A still image needs no video download when motion/data saving is preferred.
        if (choice === "auto" && !automaticPlaybackAllowed() && video.hasAttribute("src")) {
          video.removeAttribute("src");
          video.load();
          setHasFrame(false);
        }
        return;
      }
      const source = `/videos/ninja-star-hero-${mobile.matches ? "mobile" : "desktop"}.mp4`;
      if (video.getAttribute("src") !== source) {
        setHasFrame(false);
        video.src = source;
        video.load();
      }
      try {
        await video.play();
      } catch {
        // Autoplay can be blocked. Keep the poster and let the visitor press play.
        if (!disposed && currentRequest === request) setPlaying(false);
      }
    }

    const onPlaying = () => {
      if (!visible || document.hidden || !wantsPlayback()) {
        video.pause();
        return;
      }
      setHasFrame(true);
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onError = () => {
      failed = true;
      video.pause();
      setHasFrame(false);
      setUnavailable(true);
    };
    const refresh = () => { void syncPlayback(); };
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", refresh);
    mobile.addEventListener("change", refresh);
    reducedMotion.addEventListener("change", refresh);
    connection?.addEventListener("change", refresh);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    }, { threshold: 0.01 });
    observer.observe(hero);
    toggleRef.current = () => {
      choice = video.paused ? "play" : "pause";
      refresh();
    };
    setEnhanced(true);
    return () => {
      disposed = true;
      request++;
      toggleRef.current = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      mobile.removeEventListener("change", refresh);
      reducedMotion.removeEventListener("change", refresh);
      connection?.removeEventListener("change", refresh);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  return (
    <>
      <div className="hero-media" aria-hidden="true">
        <picture>
          <source media="(max-width: 750px)" srcSet="/images/ninja-star-hero-mobile.webp" />
          <img
            className="hero-image"
            src="/images/ninja-star-hero-desktop.webp"
            alt=""
            width={1280}
            height={720}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <video
          ref={videoRef}
          className={`hero-video${hasFrame ? " is-ready" : ""}`}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {enhanced && !unavailable && (
        <button
          type="button"
          className="hero-video-control"
          aria-label={playing ? "השהיית סרטון הרקע" : "ניגון סרטון הרקע"}
          onClick={() => toggleRef.current?.()}
        >
          <Icon name={playing ? "pause" : "play"} size={18} />
          <span>{playing ? "השהיה" : "ניגון"}</span>
        </button>
      )}
    </>
  );
}
