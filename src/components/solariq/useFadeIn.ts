import { useEffect, useRef } from "react";

/**
 * Adds the `.siq-show` class to elements with `.siq-fade-in` as they enter the viewport.
 * Mount once at the top of the page.
 */
export function useFadeIn() {
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const els = document.querySelectorAll<HTMLElement>(".siq-fade-in");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("siq-show");
        }),
      { threshold: 0.08 },
    );
    els.forEach((el, i) => {
      setTimeout(() => obs.observe(el), 50 + i * 30);
    });
    return () => obs.disconnect();
  }, []);
}
