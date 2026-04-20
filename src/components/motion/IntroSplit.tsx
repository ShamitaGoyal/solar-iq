import type { ReactNode, RefObject } from "react";
import { LineSplitReveal } from "@/components/motion/LineSplitReveal";

type IntroSplitProps = {
  observeTargetRef: RefObject<HTMLElement | null>;
  /**
   * Custom blocks: each must use `siq-intro-split` and `opacity-0` (same line-mask reveal as the default intro).
   * Omit for the default “Introducing Solar IQ” hero copy.
   */
  children?: ReactNode;
  /** Host layout; default depends on whether `children` is set. */
  hostClassName?: string;
};

const defaultIntroHost =
  "flex h-full flex-col items-center justify-center px-12 text-center";
const defaultCustomHost = "flex h-full flex-col justify-center px-16";

export function IntroSplit({
  observeTargetRef,
  children,
  hostClassName,
}: IntroSplitProps) {
  const resolvedHost = hostClassName ?? (children ? defaultCustomHost : defaultIntroHost);

  return (
    <LineSplitReveal observeTargetRef={observeTargetRef} hostClassName={resolvedHost}>
      {children ?? (
        <>
          <h2 className="siq-intro-split siq-tc-title font-serif-siq text-[clamp(52px,7vw,94px)] font-normal leading-[1.05] tracking-[-0.02em] text-[#f0ede0] opacity-0">
            Introducing Solar IQ:
          </h2>
          <p className="siq-intro-split siq-tc-sub mt-5 max-w-[600px] text-[clamp(20px,2.3vw,29px)] leading-[1.6] text-[#b8c4a0] opacity-0">
            Empowering Zenpower to rescue solar orphan homes
          </p>
        </>
      )}
    </LineSplitReveal>
  );
}

