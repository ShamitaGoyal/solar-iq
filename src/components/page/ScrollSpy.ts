import { useEffect, useMemo, useRef, useState } from "react";
import type { NavSection } from "./navdots/navSections";

export function useSolarIQScrollSpy(navSections: NavSection[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<HTMLElement[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const idx = sectionRefs.current.indexOf(e.target as HTMLElement);
          if (idx === -1) return;
          if (e.isIntersecting) {
            setActiveIdx(idx);
            (e.target as HTMLElement).classList.add("siq-in");
          }
        });

        // Legacy fade-in support (charts, inline elements).
        document.querySelectorAll<HTMLElement>(".siq-fade-in:not(.siq-show)").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("siq-show");
        });
      },
      { root, threshold: 0.45 },
    );

    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const setSectionRef = (i: number) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current[i] = el;
  };

  const scrollToSection = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  };

  const activeNavIdx = useMemo(
    () => navSections.reduce((acc, s, i) => (activeIdx >= s.idx ? i : acc), 0),
    [activeIdx, navSections],
  );

  return { scrollRef, setSectionRef, scrollToSection, activeIdx, activeNavIdx, sectionRefs };
}

