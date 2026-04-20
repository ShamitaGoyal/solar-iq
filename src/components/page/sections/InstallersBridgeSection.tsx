import { IntroSplit } from "@/components/motion/IntroSplit";
import type { SectionElRef, SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  observeTargetRef: SectionElRef;
};

export function InstallersBridgeSection({ setRef, observeTargetRef }: Props) {
  return (
    <section
      ref={(el) => {
        setRef(10)(el);
        observeTargetRef.current = el;
      }}
      className="siq-snap-section"
      style={{ background: "#2a3824" }}
    >
      <IntroSplit observeTargetRef={observeTargetRef}>
        <h2 className="siq-intro-split siq-tc-title font-serif-siq text-[clamp(40px,5.5vw,76px)] font-normal leading-[1.06] tracking-[-0.02em] text-[#e8e6d8] opacity-0">
          Installers exit.
          <br />
          Permits tell the story.
        </h2>
        <p className="siq-intro-split siq-tc-sub mt-6 max-w-[560px] text-[clamp(18px,2vw,24px)] leading-[1.65] text-[#a8b89e] opacity-0">
          Follow cumulative orphaned units as the market reshapes year over year.
        </p>
      </IntroSplit>
    </section>
  );
}

