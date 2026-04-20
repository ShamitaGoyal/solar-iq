import { Suspense, type ReactNode } from "react";
import { LazyMount } from "@/components/motion/LazyMount";
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
        <LazyMount
          fallback={
            <div className="flex h-screen items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
              Loading city rankings…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
                Loading city rankings…
              </div>
            }
          >
            {children}
          </Suspense>
        </LazyMount>
      </div>
    </section>
  );
}

