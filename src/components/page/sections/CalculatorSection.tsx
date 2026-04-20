import type { ReactNode } from "react";
import type { SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function CalculatorSection({ setRef, children }: Props) {
  return (
    <section ref={setRef(5)} className="siq-snap-section bg-[color:var(--siq-cream)]">
      <div className="siq-section-content h-full pt-12">
        {children}
      </div>
    </section>
  );
}

