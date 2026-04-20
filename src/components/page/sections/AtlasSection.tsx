import { Suspense, type ReactNode } from "react";
import { LazyMount } from "@/components/motion/LazyMount";
import type { SetSectionRef } from "./sectionTypes";

type Props = {
  setRef: SetSectionRef;
  children: ReactNode;
};

export function AtlasSection({ setRef, children }: Props) {
  return (
    <section ref={setRef(3)} className="siq-snap-section bg-[color:var(--siq-cream)]">
      <div className="siq-section-content flex h-full min-h-0 flex-col pt-12">
        <LazyMount
          className="min-h-0 flex-1"
          fallback={
            <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
              Loading atlas…
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
                Loading atlas…
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

