import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText);

type BridgeSplitProps = {
  /** Snap section observed to start the animation when it enters view. */
  observeTargetRef: RefObject<HTMLElement | null>;
  /**
   * Custom headline + body: add `siq-ab-split-target` on each block to stagger words.
   * Omit for the default atlas bridge copy.
   */
  children?: ReactNode;
  /** Extra classes on the animated host (layout, padding). */
  hostClassName?: string;
};

export function BridgeSplit({
  observeTargetRef,
  children,
  hostClassName,
}: BridgeSplitProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = observeTargetRef.current;
    const host = hostRef.current;
    if (!section || !host) return;

    let split: SplitText | null = null;
    let cancelled = false;

    const runSplit = () => {
      if (cancelled || split) return;
      const targets = host.querySelectorAll<HTMLElement>(".siq-ab-split-target");
      if (!targets.length) return;

      gsap.set(host, { opacity: 1 });

      split = SplitText.create(targets, {
        type: "words",
        aria: "hidden",
      });

      gsap.from(split.words, {
        opacity: 0,
        duration: 2,
        ease: "sine.out",
        stagger: 0.1,
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
    <div
      ref={hostRef}
      className={cn(
        "siq-ab-split-container flex h-full flex-col justify-center px-16 opacity-0",
        hostClassName,
      )}
    >
      {children ?? (
        <>
          <h2 className="siq-ab-split-target siq-tc-title font-serif-siq text-[clamp(40px,5.5vw,76px)] font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--siq-fg-deep)]">
            See where savings stack up,
            <br />
            state by state.
          </h2>
          <p className="siq-ab-split-target siq-tc-sub mt-6 max-w-[560px] text-[clamp(18px,2vw,24px)] leading-[1.65] text-[color:var(--siq-fg-muted)]">
            The atlas blends permits and policy signals into one view of opportunity.
          </p>
        </>
      )}
    </div>
  );
}

