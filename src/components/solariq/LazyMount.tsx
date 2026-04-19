import { useEffect, useRef, useState, type ReactNode } from "react";

export function LazyMount({
  children,
  className,
  rootMargin = "800px 0px",
  fallback,
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  fallback?: ReactNode;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const el = hostRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          obs.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={hostRef} className={className}>
      {mounted ? children : fallback ?? null}
    </div>
  );
}

