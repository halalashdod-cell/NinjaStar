"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !window.IntersectionObserver || !Element.prototype.animate) return;
    const animations = new Set<Animation>();
    const mobile = matchMedia("(max-width: 750px)");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (motion.matches) continue;
        const animation = entry.target.animate(
          [
            { opacity: 0.65, transform: `translateY(${mobile.matches ? 8 : 12}px)` },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: mobile.matches ? 260 : 320, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
        animations.add(animation);
        animation.onfinish = animation.oncancel = () => animations.delete(animation);
      }
    }, { rootMargin: "0px 0px 48px 0px", threshold: 0.01 });

    // HTML is always visible. Only enhance content that starts below the viewport.
    document.querySelectorAll("main [data-reveal]").forEach((element) => {
      if (element.getBoundingClientRect().top >= innerHeight) observer.observe(element);
    });
    const stop = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const onPreferenceChange = () => {
      if (motion.matches) stop();
    };
    motion.addEventListener("change", onPreferenceChange);
    return () => {
      stop();
      motion.removeEventListener("change", onPreferenceChange);
    };
  }, [pathname]);

  return null;
}
