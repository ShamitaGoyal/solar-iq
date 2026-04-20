import { IntroSplit } from "@/components/motion/IntroSplit";
import type { SectionElRef, SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  observeTargetRef: SectionElRef;
};

export function TransitionIntroSection({ setRef, observeTargetRef }: Props) {
  return (
    <section
      ref={(el) => {
        setRef(1)(el);
        observeTargetRef.current = el;
      }}
      className="siq-snap-section"
      style={{ background: "#1c2814" }}
    >
      <IntroSplit observeTargetRef={observeTargetRef} />
    </section>
  );
}

