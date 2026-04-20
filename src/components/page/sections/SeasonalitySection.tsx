import { Suspense, type ReactNode } from "react";
import { LazyMount } from "@/components/motion/LazyMount";
import type { SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function SeasonalitySection({ setRef, children }: Props) {
  return (
    <section ref={setRef(9)} className="siq-snap-section" style={{ background: "#35583C" }}>
      <div className="siq-section-content h-full pt-12">
        <LazyMount
          className="h-full"
          fallback={
            <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-white/45">
              Loading seasonality…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-white/45">
                Loading seasonality…
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

