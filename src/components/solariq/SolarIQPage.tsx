import { useEffect, useRef, useState } from "react";
import { IsoHouse } from "@/components/solariq/IsoHouse";
import { SavingsCalculator } from "@/components/solariq/SavingsCalculator";
import { CityRankings } from "@/components/solariq/CityRankings";
import { Seasonality } from "@/components/solariq/Seasonality";
import { SavingsAtlas } from "@/components/solariq/SavingsAtlas";
import { LineRace } from "@/components/solariq/LineRace";

// Nav dots map to visualization anchors; idx is the real section index in the scroll container.
// Order: Hero(0) T1(1) T2(2) Atlas(3) T3(4) Calculator(5) T4(6) Cities(7) T5(8) Seasons(9) T6(10) LineRace(11)
const NAV_SECTIONS = [
  { label: "Home", idx: 0 },
  { label: "Atlas", idx: 3 },
  { label: "Calculator", idx: 5 },
  { label: "Cities", idx: 7 },
  { label: "Seasons", idx: 9 },
  { label: "Installers", idx: 11 },
];

export function SolarIQPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<HTMLElement[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [zip, setZip] = useState("");
  const [billIn, setBillIn] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const onAnalyze = () => {
    if (zip.trim().length === 5 && billIn.trim()) {
      const v = parseInt(billIn, 10);
      setMsg({ text: `ZIP ${zip} analyzed — est. $${Math.round(v * 0.7)}/mo savings.`, ok: true });
    } else {
      setMsg({ text: "Enter a 5-digit ZIP and monthly bill.", ok: false });
    }
  };

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const idx = sectionRefs.current.indexOf(e.target as HTMLElement);
          if (idx === -1) return;
          if (e.isIntersecting) {
            setActiveIdx(idx);
            (e.target as HTMLElement).classList.add("siq-in");
          }
        });
        document.querySelectorAll<HTMLElement>(".siq-fade-in:not(.siq-show)").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("siq-show");
        });
      },
      { root, threshold: 0.45 },
    );
    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToSection = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  };

  const setRef = (i: number) => (el: HTMLElement | null) => {
    if (el) sectionRefs.current[i] = el;
  };

  const activeNavIdx = NAV_SECTIONS.reduce((acc, s, i) => (activeIdx >= s.idx ? i : acc), 0);

  return (
    <div className="text-[color:var(--siq-fg-deep)]">
      {/* Top navbar (SOLAR IQ + section links) — disabled for now
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-center bg-[color:var(--siq-cream)]/90 px-4 backdrop-blur-sm sm:px-7">
        <button
          type="button"
          onClick={() => scrollToSection(0)}
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

        <div className="flex max-w-[calc(100vw-9rem)] items-center gap-0.5 overflow-x-auto rounded-full bg-[color:var(--siq-fg)] px-2 py-1.5 shadow-[0_2px_14px_rgba(53,88,60,0.22)] [scrollbar-width:none] sm:max-w-none sm:gap-1 sm:px-4 sm:py-2 [&::-webkit-scrollbar]:hidden">
          {NAV_SECTIONS.map((s, i) => {
            const active = activeNavIdx === i;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => scrollToSection(s.idx)}
                className={`relative shrink-0 cursor-pointer rounded-full border-0 bg-transparent px-2.5 py-1.5 font-mono-siq text-[10px] font-medium uppercase tracking-[0.12em] text-[color:var(--siq-cream)] transition-[color,opacity] after:pointer-events-none after:absolute after:bottom-1 after:left-2 after:right-2 after:block after:h-[2px] after:origin-left after:rounded-sm after:bg-[color:var(--siq-cream)] after:transition-transform after:duration-300 after:ease-out after:content-[''] sm:px-3.5 sm:text-[11px] sm:tracking-[0.14em] ${active ? "after:scale-x-100" : "after:scale-x-0 hover:opacity-90"
                  }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </nav>
      */}

      <div className="fixed right-5 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-3">
        {NAV_SECTIONS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => scrollToSection(s.idx)}
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

      <div ref={scrollRef} className="siq-scroll-root">
        {/* ── 0: HERO ── */}
        <section ref={setRef(0)} className="siq-snap-section siq-in bg-[color:var(--siq-cream)]">
          <div className="grid h-full grid-cols-1 pt-12 md:grid-cols-2">
            <div className="flex flex-col justify-center px-20 py-10 mt-[-7rem]">
              <div className="siq-section-content mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(53,88,60,0.22)] px-4 py-1.5">
                <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-[color:var(--siq-fg)]" />
                <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
                  Solar intelligence
                </span>
              </div>
              <h1 className="siq-section-content mb-5 font-sans-siq text-[clamp(44px,5.5vw,60px)] font-normal leading-[0.98] tracking-[-0.015em] text-[color:var(--siq-fg-deep)]">
                See how much you could be saving homeowners with solar.
              </h1>
              <p className="siq-section-content mb-8 max-w-[400px] text-[16px] leading-[1.75] text-[color:var(--siq-fg-muted)]">
                Cross-reference real permit data, local irradiance scores, and utility rates to see exactly what you'd save.
              </p>
              {/* <div className="siq-section-content mb-2.5 flex w-full max-w-[480px] border border-[var(--siq-border-strong)]">
                <input
                  className="h-12 flex-1 border-r border-[var(--siq-border)] bg-transparent px-4 font-mono-siq text-[14px] text-[color:var(--siq-fg-deep)] outline-none placeholder:text-[color:var(--siq-fg-muted)]"
                  placeholder="ZIP code"
                  maxLength={5}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
                <input
                  className="h-12 flex-1 border-r border-[var(--siq-border)] bg-transparent px-4 font-mono-siq text-[14px] text-[color:var(--siq-fg-deep)] outline-none placeholder:text-[color:var(--siq-fg-muted)]"
                  placeholder="Monthly bill $"
                  value={billIn}
                  onChange={(e) => setBillIn(e.target.value)}
                />
                <button
                  onClick={onAnalyze}
                  className="h-12 shrink-0 cursor-pointer whitespace-nowrap bg-[color:var(--siq-fg)] px-6 font-mono-siq text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--siq-cream)] transition-colors hover:bg-[color:var(--siq-fg-deep)]"
                >
                  Analyze
                </button>
              </div> */}
              <div className="min-h-5 text-[13px]" style={{ color: msg?.ok === false ? "#a04040" : "var(--siq-fg-light)" }}>
                {msg?.text}
              </div>
            </div>
            <div className="relative overflow-hidden bg-[color:var(--siq-cream)] pt-12">
              <IsoHouse />
            </div>
          </div>
          {/* Scroll cue */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
            <span
              className="font-mono-siq inline-block text-[10px] uppercase tracking-[0.2em] text-[color:var(--siq-fg-muted)]"
              style={{ animation: "scrollTextBounce 1.7s ease-in-out infinite" }}
            >
              scroll
            </span>
            <div
              className="h-6 w-px bg-[color:var(--siq-fg-muted)]"
              style={{ animation: "scrollBounce 1.8s ease-in-out infinite" }}
            />
          </div>
        </section>

        {/* ── 1: TRANSITION 1 — Introducing Solar IQ (dark, centered) ── */}
        <section ref={setRef(1)} className="siq-snap-section" style={{ background: "#1c2814" }}>
          <div className="flex h-full flex-col items-center justify-center px-12 text-center">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(52px,7vw,94px)] font-normal leading-[1.05] tracking-[-0.02em] text-[#f0ede0]">
              Introducing Solar IQ:
            </h2>
            <p className="siq-tc-sub mt-5 max-w-[600px] text-[clamp(20px,2.3vw,29px)] leading-[1.6] text-[#b8c4a0]">
              Empowering Zenpower to rescue solar orphan homes
            </p>
          </div>
        </section>

        {/* ── 2: TRANSITION 2 — Atlas bridge (cream, left) ── */}
        <section ref={setRef(2)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(40px,5.5vw,76px)] font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--siq-fg-deep)]">
              See where savings stack up,
              <br />
              state by state.
            </h2>
            <p className="siq-tc-sub mt-6 max-w-[560px] text-[clamp(18px,2vw,24px)] leading-[1.65] text-[color:var(--siq-fg-muted)]">
              The atlas blends permits and policy signals into one view of opportunity.
            </p>
          </div>
        </section>

        {/* ── 3: ATLAS ── */}
        <section ref={setRef(3)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content flex h-full min-h-0 flex-col pt-12">
            <SavingsAtlas />
          </div>
        </section>

        {/* ── 4: TRANSITION 3 — Zero in on cities (cream, left) ── */}
        <section ref={setRef(4)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(47px,6.5vw,86px)] font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--siq-fg-deep)]">
              Zero in on the top five most
              <br />
              in-demand cities by total permits
            </h2>
          </div>
        </section>

        {/* ── 5: CALCULATOR ── */}
        <section ref={setRef(5)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <SavingsCalculator />
          </div>
        </section>

        {/* ── 6: TRANSITION 4 — Calculator → cities (cream, left) ── */}
        <section ref={setRef(6)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(40px,5.5vw,76px)] font-normal leading-[1.08] tracking-[-0.02em] text-[color:var(--siq-fg-deep)]">
              From statewide signals
              <br />
              to city streets.
            </h2>
          </div>
        </section>

        {/* ── 7: CITY RANKINGS ── */}
        <section ref={setRef(7)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content flex h-full min-h-0 flex-col pt-12">
            <CityRankings />
          </div>
        </section>

        {/* ── 8: TRANSITION 5 — Capture customers (tan, left) ── */}
        <section ref={setRef(8)} className="siq-snap-section" style={{ background: "#c8b89a" }}>
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(47px,6.5vw,86px)] font-normal leading-[1.05] tracking-[-0.02em] text-[#2a2018]">
              Capture customers
              <br />
              at the right time,
              <br />
              every time.
            </h2>
            <p className="siq-tc-sub mt-6 max-w-[580px] text-[clamp(20px,2.2vw,26px)] leading-[1.65] text-[#4a3828]">
              Zenpower currently serves 4 states. See where to expand to next, based on per-capita annual savings.
            </p>
          </div>
        </section>

        {/* ── 9: SEASONALITY ── */}
        <section ref={setRef(9)} className="siq-snap-section" style={{ background: "#35583C" }}>
          <div className="siq-section-content h-full pt-12">
            <Seasonality />
          </div>
        </section>

        {/* ── 10: TRANSITION 6 — Seasons → installers (dark, left) ── */}
        <section ref={setRef(10)} className="siq-snap-section" style={{ background: "#2a3824" }}>
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(40px,5.5vw,76px)] font-normal leading-[1.06] tracking-[-0.02em] text-[#e8e6d8]">
              Installers exit.
              <br />
              Permits tell the story.
            </h2>
            <p className="siq-tc-sub mt-6 max-w-[560px] text-[clamp(18px,2vw,24px)] leading-[1.65] text-[#a8b89e]">
              Follow cumulative orphaned units as the market reshapes year over year.
            </p>
          </div>
        </section>

        {/* ── 11: LINE RACE ── */}
        <section ref={setRef(11)} className="siq-snap-section flex flex-col bg-[color:var(--siq-cream)]">
          <div className="siq-section-content flex min-h-0 flex-1 flex-col pt-12">
            <LineRace />
          </div>
          {/* Footer inside last section */}
          <footer className="pt-[2rem] flex items-center justify-between px-10 py-3">
            <span className="font-mono-siq text-[11px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
              Solar IQ · DataHacks 2026
            </span>
            <span className="font-mono-siq text-[11px] text-[color:var(--siq-fg-muted)]">
              @MakeAFish
            </span>
          </footer>
        </section>
      </div>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.4); opacity: 0.8; }
        }
        @keyframes scrollTextBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
