import type { ReactNode } from "react";
import type { SetSectionRef } from "./sectionTypes";
import { Footer } from "./Footer";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function OpportunitySection({ setRef, children }: Props) {
  return (
    <section ref={setRef(13)} className="siq-snap-section flex flex-col bg-[color:var(--siq-cream)]">
      <div className="siq-section-content flex min-h-0 flex-1 flex-col pt-12">
        <div className="min-h-0 flex-1">{children}</div>
      </div>
      <Footer />
    </section>
  );
}
