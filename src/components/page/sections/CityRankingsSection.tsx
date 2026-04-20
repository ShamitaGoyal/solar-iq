import type { ReactNode } from "react";
import type { SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function CityRankingsSection({ setRef, children }: Props) {
  return (
    <section
      ref={setRef(7)}
      className="siq-snap-section siq-snap-section--scrollable bg-[color:var(--siq-cream)]"
    >
      <div className="siq-section-content flex flex-col pt-12">
        {children}
      </div>
    </section>
  );
}

