import type { CSSProperties } from "react";
import { BridgeSplit } from "@/components/motion/BridgeSplit";
import type { SectionElRef, SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  observeTargetRef: SectionElRef;
};

export function SeasonalityBridgeSection({ setRef, observeTargetRef }: Props) {
  return (
    <section
      ref={(el) => {
        setRef(8)(el);
        observeTargetRef.current = el;
      }}
      className="siq-snap-section relative overflow-hidden"
      style={{ background: "#c8b89a" }}
    >
      {/* Right-side orbs: soft fill + dotted SVG stroke with marching-dash animation */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[min(100%,560px)]" aria-hidden>
        <div className="absolute -right-[48px] top-[7%] h-[280px] w-[280px] [animation:siq-orb1_14s_ease-in-out_infinite]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="48" fill="rgba(42,32,24,0.05)" />
            <circle
              cx="50"
              cy="50"
              r="48"
              className="siq-dotted-orbit-ring stroke-[rgba(42,32,24,0.42)]"
              strokeWidth={1.35}
              style={{ "--siq-dot-march-duration": "7.2s" } as CSSProperties}
            />
          </svg>
        </div>
        <div className="absolute right-[4%] bottom-[14%] h-[168px] w-[168px] [animation:siq-orb2_18s_ease-in-out_infinite]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="48" fill="rgba(42,32,24,0.04)" />
            <circle
              cx="50"
              cy="50"
              r="48"
              className="siq-dotted-orbit-ring siq-dotted-orbit-ring--rev stroke-[rgba(42,32,24,0.36)]"
              strokeWidth={1.15}
              style={{ "--siq-dot-march-duration": "5.4s" } as CSSProperties}
            />
          </svg>
        </div>
        <div className="absolute right-[14%] top-1/2 h-[96px] w-[96px] -translate-y-1/2 [animation:siq-orb1_16s_ease-in-out_infinite]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="48" fill="rgba(74,56,40,0.06)" />
            <circle
              cx="50"
              cy="50"
              r="48"
              className="siq-dotted-orbit-ring stroke-[rgba(53,88,60,0.5)]"
              strokeWidth={1.2}
              style={{ "--siq-dot-march-duration": "4.2s" } as CSSProperties}
            />
          </svg>
        </div>
        <div className="absolute right-[20%] top-[58%] h-[56px] w-[56px] [animation:siq-orb2_20s_ease-in-out_infinite]">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="48" fill="rgba(53,88,60,0.07)" />
            <circle
              cx="50"
              cy="50"
              r="48"
              className="siq-dotted-orbit-ring siq-dotted-orbit-ring--rev stroke-[rgba(53,88,60,0.45)]"
              strokeWidth={1.1}
              style={{ "--siq-dot-march-duration": "3.6s" } as CSSProperties}
            />
          </svg>
        </div>
      </div>

      <BridgeSplit observeTargetRef={observeTargetRef} hostClassName="relative z-10">
        <h2 className="siq-ab-split-target siq-tc-title font-serif-siq text-[clamp(47px,6.5vw,80px)] font-normal leading-[1] tracking-[-0.02em] text-[#2a2018]">
          Capture customers
          <br />
          at the right time,
          <br />
          every time.
        </h2>
        <p className="siq-ab-split-target siq-tc-sub mt-6 max-w-[580px] text-[clamp(20px,2.2vw,22px)] leading-[1.65] text-[#4a3828]">
          View trends in installation volume month by month, season by season.
        </p>
      </BridgeSplit>
    </section>
  );
}

