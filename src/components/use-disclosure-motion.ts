"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** The panel starts with `hidden` in JSX; this hook owns that attribute thereafter. */
export function useDisclosureMotion<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);
  const animationRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const wasHidden = panel.hidden;
    const current = getComputedStyle(panel);
    const from = {
      opacity: wasHidden ? "0" : current.opacity,
      transform: wasHidden ? "translateY(-8px)" : current.transform,
    };
    animationRef.current?.cancel();
    animationRef.current = null;

    const settle = () => {
      animationRef.current?.cancel();
      animationRef.current = null;
      panel.hidden = !open;
    };
    if (motion.matches || !panel.animate || (!open && wasHidden)) {
      settle();
    } else {
      panel.hidden = false;
      const animation = panel.animate(
        [from, {
          opacity: open ? "1" : "0",
          transform: open ? "translateY(0)" : "translateY(-8px)",
        }],
        { duration: 200, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" },
      );
      animationRef.current = animation;
      animation.onfinish = settle;
    }
    const onPreferenceChange = () => {
      if (motion.matches) settle();
    };
    motion.addEventListener("change", onPreferenceChange);
    return () => motion.removeEventListener("change", onPreferenceChange);
  }, [open]);

  useEffect(() => () => animationRef.current?.cancel(), []);
  return ref;
}
