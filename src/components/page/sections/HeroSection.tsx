import { IsoHouse } from "@/components/page/hero/IsoHouse";
import { LineSplitReveal } from "@/components/motion/LineSplitReveal";
import type { SectionElRef, SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  observeTargetRef: SectionElRef;
  msg: { text: string; ok: boolean } | null;
};

export function HeroSection({ setRef, observeTargetRef, msg }: Props) {
  return (
    <section
      ref={(el) => {
        setRef(0)(el);
        observeTargetRef.current = el;
      }}
      className="siq-snap-section siq-in bg-[color:var(--siq-cream)]"
    >
      <div className="grid h-full grid-cols-1 pt-12 md:grid-cols-2">
        <div className="flex flex-col justify-center px-20 py-10 mt-[-7rem]">
          <div className="siq-section-content mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(53,88,60,0.22)] px-4 py-1.5">
            <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-[color:var(--siq-fg)]" />
            <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
              Solar intelligence
            </span>
          </div>

          <LineSplitReveal observeTargetRef={observeTargetRef} hostClassName="min-w-0">
            <h1 className="siq-intro-split siq-section-content mb-5 font-sans-siq text-[clamp(44px,5.5vw,60px)] font-normal leading-[0.98] tracking-[-0.015em] text-[color:var(--siq-fg-deep)] opacity-0">
              See how much you could be saving homeowners with solar.
            </h1>
          </LineSplitReveal>

          <p className="siq-section-content mb-8 max-w-[400px] text-[16px] leading-[1.75] text-[color:var(--siq-fg-muted)]">
            Cross-reference real permit data, local irradiance scores, and utility rates to see exactly what you'd save.
          </p>

          <div
            className="min-h-5 text-[13px]"
            style={{ color: msg?.ok === false ? "#a04040" : "var(--siq-fg-light)" }}
          >
            {msg?.text}
          </div>
        </div>

        <div className="relative overflow-hidden bg-[color:var(--siq-cream)] pt-12">
          <IsoHouse />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span
          className="font-mono-siq inline-block text-[10px] uppercase tracking-[0.2em] text-[color:var(--siq-fg-muted)]"
          style={{ animation: "scrollTextBounce 1.7s ease-in-out infinite" }}
        >
          scroll
        </span>
        <div
          className="h-6 w-px bg-[color:var(--siq-fg-muted)]"
          style={{ animation: "scrollBounce 1.8s ease-in-out infinite" }}
        />
      </div>
    </section>
  );
}

