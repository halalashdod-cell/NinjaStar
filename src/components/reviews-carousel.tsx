"use client";

import { useId, useRef, useState } from "react";
import { reviews } from "@/lib/reviews";
import { Icon } from "./icon";

export function ReviewsCarousel() {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function goTo(index: number) {
    const next = (index + reviews.length) % reviews.length;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    trackRef.current?.children[next]?.scrollIntoView({
      behavior: reduceMotion ? "instant" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }

  function syncActive() {
    const track = trackRef.current;
    if (!track) return;
    const bounds = track.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;
    let closest = 0;
    let distance = Infinity;
    Array.from(track.children).forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const nextDistance = Math.abs(rect.left + rect.width / 2 - center);
      if (nextDistance < distance) {
        closest = index;
        distance = nextDistance;
      }
    });
    setActive(closest);
  }

  return (
    <section
      className="section container reviews-section"
      aria-label="חוות דעת של מבקרים"
      aria-roledescription="קרוסלה"
    >
      <div
        ref={trackRef}
        id={`${id}-track`}
        className="reviews-track"
        tabIndex={0}
        aria-label="ביקורות מבקרים; אפשר לדפדף עם מקשי החצים"
        onScroll={syncActive}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            goTo(active + (event.key === "ArrowLeft" ? 1 : -1));
          }
        }}
      >
        {reviews.map((review, index) => (
          <article
            className="review-slide"
            key={review.author}
            aria-roledescription="שקופית"
            aria-label={`${index + 1} מתוך ${reviews.length}`}
          >
            <Icon name="quote" size={35} className="review-quote-mark" />
            <blockquote>
              <p>״{review.quote}״</p>
            </blockquote>
            <div className="review-author">
              <span className="review-avatar" aria-hidden="true">
                {review.initial}
              </span>
              <div>
                <cite dir="auto">{review.author}</cite>
                <span className="review-meta">Google · {review.branch}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="reviews-controls">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="הביקורת הקודמת"
          aria-controls={`${id}-track`}
        >
          <Icon name="right" />
        </button>
        <div className="review-dots" aria-label="בחירת ביקורת">
          {reviews.map((review, index) => (
            <button
              key={review.author}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`לביקורת מספר ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              aria-controls={`${id}-track`}
            >
              <span />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="הביקורת הבאה"
          aria-controls={`${id}-track`}
        >
          <Icon name="left" />
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        ביקורת {active + 1} מתוך {reviews.length}
      </p>
    </section>
  );
}
