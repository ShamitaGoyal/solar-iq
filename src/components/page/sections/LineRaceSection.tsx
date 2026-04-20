import { Suspense, type ReactNode } from "react";
import { LazyMount } from "@/components/motion/LazyMount";
import type { SetSectionRef } from "./sectionTypes";
import { Footer } from "./Footer";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function LineRaceSection({ setRef, children }: Props) {
  return (
    <section ref={setRef(11)} className="siq-snap-section flex flex-col bg-[color:var(--siq-cream)]">
      <div className="siq-section-content flex min-h-0 flex-1 flex-col pt-12">
        <LazyMount
          className="min-h-0 flex-1"
          fallback={
            <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
              Loading installers…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
                Loading installers…
              </div>
            }
          >
            {children}
          </Suspense>
        </LazyMount>
      </div>
      <Footer />
    </section>
  );
}

