import { Suspense, type ReactNode } from "react";
import { LazyMount } from "@/components/motion/LazyMount";
import type { SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function CalculatorSection({ setRef, children }: Props) {
  return (
    <section ref={setRef(5)} className="siq-snap-section bg-[color:var(--siq-cream)]">
      <div className="siq-section-content h-full pt-12">
        <LazyMount
          className="h-full"
          fallback={
            <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
              Loading calculator…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
                Loading calculator…
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

