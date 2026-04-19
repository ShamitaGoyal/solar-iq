import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export type SolarIqLineSplitRevealProps = {
  /** Snap section (or other element) observed to start the split when it enters view. */
  observeTargetRef: RefObject<HTMLElement | null>;
  /** Tailwind classes for the host wrapper (layout + padding). */
  hostClassName: string;
  /** Markup: elements that should split must use class `siq-intro-split` (and typically `opacity-0`). */
  children: ReactNode;
};

/**
 * Line-mask SplitText reveal (words + lines, expo stagger) — same behavior as the dark “Introducing Solar IQ” block.
 */
export function SolarIqLineSplitReveal({ observeTargetRef, hostClassName, children }: SolarIqLineSplitRevealProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = observeTargetRef.current;
    const host = hostRef.current;
    if (!section || !host) return;

    let split: SplitText | null = null;
    let cancelled = false;

    const runSplit = () => {
      if (cancelled || split) return;
      const targets = host.querySelectorAll<HTMLElement>(".siq-intro-split");
      if (!targets.length) return;

      gsap.set(targets, { opacity: 1 });

      split = SplitText.create(targets, {
        type: "words,lines",
        linesClass: "siq-intro-line",
        autoSplit: true,
        mask: "lines",
        onSplit: (self) =>
          gsap.from(self.lines, {
            duration: 0.6,
            yPercent: 100,
            opacity: 0,
            stagger: 0.1,
            ease: "expo.out",
          }),
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35);
        if (!hit) return;
        void document.fonts.ready.then(runSplit);
        io.disconnect();
      },
      { threshold: [0, 0.35, 0.6] },
    );
    io.observe(section);

    return () => {
      cancelled = true;
      io.disconnect();
      split?.revert();
      split = null;
    };
  }, [observeTargetRef]);

  return (
    <div ref={hostRef} className={hostClassName}>
      {children}
    </div>
  );
}
