import type { ReactNode } from "react";
import type { SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function SeasonalitySection({ setRef, children }: Props) {
  return (
    <section ref={setRef(9)} className="siq-snap-section" style={{ background: "#35583C" }}>
      <div className="siq-section-content h-full pt-12">
        {children}
      </div>
    </section>
  );
}

