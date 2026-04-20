import { LineSplitReveal } from "@/components/motion/LineSplitReveal";
import type { SectionElRef, SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  observeTargetRef: SectionElRef;
};

export function CalculatorToCitiesSection({ setRef, observeTargetRef }: Props) {
  return (
    <section
      ref={(el) => {
        setRef(6)(el);
        observeTargetRef.current = el;
      }}
      className="siq-snap-section bg-[color:var(--siq-cream)]"
    >
      <LineSplitReveal
        observeTargetRef={observeTargetRef}
        hostClassName="flex h-full flex-col justify-center px-16"
      >
        <h2 className="siq-intro-split siq-tc-title font-serif-siq text-[clamp(47px,6.5vw,75px)] text-center font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--siq-fg-deep)] opacity-0">
          Zero in on the top five most
          <br />
          in-demand cities by total permits
        </h2>
      </LineSplitReveal>
    </section>
  );
}

