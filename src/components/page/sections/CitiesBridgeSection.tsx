import { TypingHeadline } from "@/components/motion/TypingHeadline";
import type { SectionElRef, SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  observeTargetRef: SectionElRef;
};

export function CitiesBridgeSection({ setRef, observeTargetRef }: Props) {
  return (
    <section
      ref={(el) => {
        setRef(4)(el);
        observeTargetRef.current = el;
      }}
      className="siq-snap-section relative overflow-hidden bg-[color:var(--siq-cream)]"
    >
      {/* Same orb treatment as SavingsCalculator right panel; fg tint reads on cream */}
      <div className="pointer-events-none absolute -right-[60px] -top-[60px] h-[280px] w-[280px] rounded-full bg-[color:var(--siq-fg)]/[0.055] [animation:siq-orb1_14s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -left-[40px] bottom-10 h-[160px] w-[160px] rounded-full bg-[color:var(--siq-fg)]/[0.038] [animation:siq-orb2_18s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-[55%] top-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(168,232,144,0.08)]" />
      <div className="pointer-events-none absolute bottom-20 right-20 h-[50px] w-[50px] rounded-full bg-[rgba(168,232,144,0.06)]" />

      <TypingHeadline
        observeTargetRef={observeTargetRef}
        hostClassName="relative z-10 flex h-full flex-col items-center justify-center px-16 text-center"
        titleClassName="siq-tc-title font-serif-siq text-[clamp(40px,5.5vw,76px)] font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--siq-fg-deep)]"
        text={"From statewide signals\nto city streets."}
        durationMs={3200}
      />
    </section>
  );
}

