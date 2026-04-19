import { useEffect, useRef, useState, type RefObject } from "react";

export type SolarIqTypingHeadlineProps = {
  observeTargetRef: RefObject<HTMLElement | null>;
  hostClassName: string;
  titleClassName: string;
  /** Use `\n` for line breaks; rendered with `white-space: pre-line`. */
  text: string;
  /** Total time to reveal all characters (ms). */
  durationMs?: number;
};

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function SolarIqTypingHeadline({
  observeTargetRef,
  hostClassName,
  titleClassName,
  text,
  durationMs = 3000,
}: SolarIqTypingHeadlineProps) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const section = observeTargetRef.current;
    if (!section) return;

    let cancelled = false;
    let started = false;

    const start = () => {
      if (started || cancelled) return;
      started = true;
      const startTime = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / durationMs);
        const eased = easeOutCubic(t);
        const len = Math.round(eased * text.length);
        setShown(text.slice(0, len));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDone(true);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.35);
        if (!hit) return;
        void document.fonts.ready.then(() => {
          if (!cancelled) start();
        });
        io.disconnect();
      },
      { threshold: [0, 0.35, 0.6] },
    );
    io.observe(section);

    return () => {
      cancelled = true;
      io.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [observeTargetRef, text, durationMs]);

  return (
    <div className={hostClassName}>
      <h2
        className={titleClassName}
        aria-label={text.replace(/\n/g, " ")}
        style={{ whiteSpace: "pre-line" }}
      >
        {shown}
        {!done && (
          <span
            aria-hidden
            className="ml-[0.1em] inline-block h-[0.62em] w-[2px] translate-y-[0.06em] animate-pulse bg-[color:var(--siq-fg-deep)] align-middle"
          />
        )}
      </h2>
    </div>
  );
}
