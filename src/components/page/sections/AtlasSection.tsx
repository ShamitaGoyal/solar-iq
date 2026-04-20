import type { ReactNode } from "react";
import type { SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function AtlasSection({ setRef, children }: Props) {
  return (
    <section ref={setRef(3)} className="siq-snap-section bg-[color:var(--siq-cream)]">
      <div className="siq-section-content flex h-full min-h-0 flex-col pt-12">
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </section>
  );
}

