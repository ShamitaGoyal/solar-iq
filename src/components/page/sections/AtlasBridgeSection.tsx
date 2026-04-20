import { BridgeSplit } from "@/components/motion/BridgeSplit";
import type { SectionElRef, SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  observeTargetRef: SectionElRef;
};

export function AtlasBridgeSection({ setRef, observeTargetRef }: Props) {
  return (
    <section
      ref={(el) => {
        setRef(2)(el);
        observeTargetRef.current = el;
      }}
      className="siq-snap-section bg-[color:var(--siq-cream)]"
    >
      <BridgeSplit observeTargetRef={observeTargetRef} />
    </section>
  );
}

