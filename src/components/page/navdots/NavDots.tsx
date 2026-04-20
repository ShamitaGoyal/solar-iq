import type { NavSection } from "./navSections";

export function NavDots({
  sections,
  activeNavIdx,
  onJump,
}: {
  sections: NavSection[];
  activeNavIdx: number;
  onJump: (sectionIdx: number) => void;
}) {
  return (
    <div className="fixed right-5 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-3">
      {sections.map((s, i) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onJump(s.idx)}
          title={s.label}
          className="group relative flex items-center justify-end"
        >
          <span className="mr-2 hidden text-[10px] font-medium uppercase tracking-[0.1em] text-[color:var(--siq-fg)] opacity-0 transition-opacity group-hover:opacity-100">
            {s.label}
          </span>
          <span
            className="block rounded-full transition-all duration-300"
            style={{
              width: activeNavIdx === i ? 10 : 6,
              height: activeNavIdx === i ? 10 : 6,
              background: activeNavIdx === i ? "var(--siq-fg)" : "rgba(53,88,60,0.3)",
            }}
          />
        </button>
      ))}
    </div>
  );
}

