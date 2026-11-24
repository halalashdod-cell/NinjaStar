"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { Icon } from "./icon";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const desiredOpen = useRef(false);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (!motion.matches || !ref.current || !animationRef.current) return;
      animationRef.current.cancel();
      animationRef.current = null;
      ref.current.open = desiredOpen.current;
      ref.current.style.overflow = "";
    };
    motion.addEventListener("change", settle);
    return () => {
      motion.removeEventListener("change", settle);
      animationRef.current?.cancel();
    };
  }, []);

  function toggle(event: MouseEvent<HTMLElement>) {
    const details = ref.current;
    if (!details) return;
    event.preventDefault();
    const summary = event.currentTarget;
    const from = details.getBoundingClientRect().height;
    const open = animationRef.current ? !desiredOpen.current : !details.open;
    desiredOpen.current = open;
    animationRef.current?.cancel();
    animationRef.current = null;
    summary.setAttribute("aria-expanded", String(open));

    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !details.animate) {
      details.open = open;
      details.style.overflow = "";
      return;
    }

    // Keep native details content in the layout until the closing animation ends.
    details.open = true;
    const styles = getComputedStyle(details);
    const closedHeight = summary.getBoundingClientRect().height
      + parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const to = open ? details.getBoundingClientRect().height : closedHeight;
    details.style.overflow = "hidden";
    const animation = details.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" },
    );
    animationRef.current = animation;
    animation.onfinish = () => {
      details.open = open;
      details.style.overflow = "";
      animation.cancel();
      animationRef.current = null;
    };
  }

  return (
    <details ref={ref}>
      <summary onClick={toggle}>
        {question}
        <Icon name="down" size={20} />
      </summary>
      <p>{answer}</p>
    </details>
  );
}
