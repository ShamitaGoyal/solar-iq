import type { NavSection } from "../navdots/navSections";

type Props = {
  sections: NavSection[];
  activeNavIdx: number;
  onJump: (idx: number) => void;
};

export function Navbar({ sections, activeNavIdx, onJump }: Props) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-center bg-[color:var(--siq-cream)]/90 px-4 backdrop-blur-sm sm:px-7">
      <button
        type="button"
        onClick={() => onJump(0)}
        className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-[13px] font-semibold tracking-[0.06em] text-[color:var(--siq-fg-deep)] outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-[color:var(--siq-fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--siq-cream)] sm:left-7"
        aria-label="Go to home / hero"
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--siq-fg)]">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <circle cx="6" cy="6" r="2.2" fill="#FCFAEF" />
            <line x1="6" y1="1" x2="6" y2="3" stroke="#FCFAEF" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="6" y1="9" x2="6" y2="11" stroke="#FCFAEF" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="1" y1="6" x2="3" y2="6" stroke="#FCFAEF" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="9" y1="6" x2="11" y2="6" stroke="#FCFAEF" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        SOLAR IQ
      </button>

      {/* <div className="flex max-w-[calc(100vw-9rem)] items-center gap-0.5 overflow-x-auto rounded-full bg-[color:var(--siq-fg)] px-2 py-1.5 shadow-[0_2px_14px_rgba(53,88,60,0.22)] [scrollbar-width:none] sm:max-w-none sm:gap-1 sm:px-4 sm:py-2 [&::-webkit-scrollbar]:hidden">
        {sections.map((s, i) => {
          const active = activeNavIdx === i;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => onJump(s.idx)}
              className={`relative shrink-0 cursor-pointer rounded-full border-0 bg-transparent px-2.5 py-1.5 font-mono-siq text-[10px] font-medium uppercase tracking-[0.12em] text-[color:var(--siq-cream)] transition-[color,opacity] after:pointer-events-none after:absolute after:bottom-1 after:left-2 after:right-2 after:block after:h-[2px] after:origin-left after:rounded-sm after:bg-[color:var(--siq-cream)] after:transition-transform after:duration-300 after:ease-out after:content-[''] sm:px-3.5 sm:text-[11px] sm:tracking-[0.14em] ${
                active ? "after:scale-x-100" : "after:scale-x-0 hover:opacity-90"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div> */}
    </nav>
  );
}

