import { useEffect, useRef, useState } from "react";
import { IsoHouse } from "@/components/solariq/IsoHouse";
import { SavingsCalculator } from "@/components/solariq/SavingsCalculator";
import { CityRankings } from "@/components/solariq/CityRankings";
import { Seasonality } from "@/components/solariq/Seasonality";
import { SavingsAtlas } from "@/components/solariq/SavingsAtlas";
import { LineRace } from "@/components/solariq/LineRace";

// Nav items only list the 6 visualization sections; idx is the real section index
// Order: Hero(0) T1(1) T2(2) Atlas(3) T3(4) Calculator(5) T4(6) Cities(7) T5(8) Seasons(9) T6(10) LineRace(11)
const NAV_SECTIONS = [
  { label: "Home",       idx: 0  },
  { label: "Atlas",      idx: 3  },
  { label: "Calculator", idx: 5  },
  { label: "Cities",     idx: 7  },
  { label: "Seasons",    idx: 9  },
  { label: "Installers", idx: 11 },
];

// Full section count (6 viz + 6 transitions)
const TOTAL_SECTIONS = 12;

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

  // Find which nav item is active based on current section
  const activeNavIdx = NAV_SECTIONS.reduce(
    (acc, s, i) => (activeIdx >= s.idx ? i : acc),
    0,
  );

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }} className="text-[color:var(--siq-fg-deep)]">
      {/* Fixed nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-start bg-[color:var(--siq-cream)]/90 px-7 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => scrollToSection(0)}
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-[13px] font-semibold tracking-[0.06em] text-[color:var(--siq-fg-deep)] outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-[color:var(--siq-fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--siq-cream)]"
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
        <div className="flex items-center gap-6 font-mono-siq text-[11px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
          {NAV_SECTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => scrollToSection(s.idx)}
              className="transition-colors hover:text-[color:var(--siq-fg)]"
              style={{ color: activeNavIdx === i ? "var(--siq-fg)" : undefined, fontWeight: activeNavIdx === i ? 500 : undefined }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Dot nav — only 6 dots for the viz sections */}
      <div className="fixed right-5 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-3">
        {NAV_SECTIONS.map((s, i) => (
          <button
            key={i}
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

      {/* Scroll container */}
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
              <h1 className="siq-section-content mb-5 font-serif-siq text-[clamp(44px,5.5vw,72px)] font-normal leading-[1.05] tracking-[-0.015em] text-[color:var(--siq-fg-deep)]">
                See how much you
                <br />
                could be saving homeowners with <em className="not-italic italic text-[color:var(--siq-fg)]">solar.</em>
              </h1>
              <p className="siq-section-content mb-8 max-w-[400px] text-[16px] leading-[1.75] text-[color:var(--siq-fg-muted)]">
                Cross-reference permit activity, local irradiance scores, and utility rates to find where solar demand is likely to grow.
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
            <span className="font-mono-siq text-[10px] uppercase tracking-[0.2em] text-[color:var(--siq-fg-muted)]">scroll</span>
            <div className="h-6 w-px bg-[color:var(--siq-fg-muted)]" style={{ animationName: "scrollBounce" }} />
          </div>
        </section>

        {/* ── 1: TRANSITION 1 — Introducing Solar IQ (dark, centered) ── */}
        <section ref={setRef(1)} className="siq-snap-section" style={{ background: "#1c2814" }}>
          <div className="flex h-full flex-col items-center justify-center text-center px-12">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(52px,7vw,94px)] font-normal leading-[1.05] tracking-[-0.02em] text-[#f0ede0]">
              Introducing Solar IQ:
            </h2>
            <p className="siq-tc-sub mt-5 max-w-[600px] text-[clamp(20px,2.3vw,29px)] leading-[1.6] text-[#b8c4a0]">
              Empowering Zenpower to rescue solar orphan homes
            </p>
          </div>
        </section>

        {/* ── 2: TRANSITION 2 — Zenpower serves 4 states (medium olive, left) ── */}
        <section ref={setRef(2)} className="siq-snap-section" style={{ background: "#3d4e2e" }}>
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(52px,7vw,91px)] font-normal leading-[1.05] tracking-[-0.02em] text-[#f0ede0]">
              Zenpower currently serves 4 states.
              <br />
              Where are you going next?
            </h2>
            <p className="siq-tc-sub mt-6 max-w-[600px] text-[clamp(20px,2.2vw,26px)] leading-[1.65] text-[#b8c4a0]">
              See where to expand
              <br />
              next, based on per-capita annual savings.
            </p>
          </div>
        </section>

        {/* ── 3: ATLAS ── */}
        <section ref={setRef(3)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <SavingsAtlas />
          </div>
        </section>

        {/* ── 4: TRANSITION 3 — Zero in on cities (cream, left) ── */}
        <section ref={setRef(4)} className="siq-snap-section relative overflow-hidden bg-[color:var(--siq-cream)]">
          {/* soft orbs behind the title */}
          <div className="pointer-events-none absolute -left-[120px] -top-[120px] h-[340px] w-[340px] rounded-full bg-[rgba(53,88,60,0.08)] [animation:siq-orb1_14s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute right-[10%] top-[10%] h-[240px] w-[240px] rounded-full bg-[rgba(42,32,24,0.05)] [animation:siq-orb2_18s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute left-[45%] bottom-[8%] h-[160px] w-[160px] -translate-x-1/2 rounded-full bg-[rgba(53,88,60,0.06)]" />
          <div className="pointer-events-none absolute bottom-[18%] right-[12%] h-[90px] w-[90px] rounded-full bg-[rgba(42,32,24,0.04)]" />

          <div className="relative z-10 flex h-full flex-col justify-center px-16">
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

        {/* ── 6: TRANSITION 4 — Have an area in mind? (cream, left) ── */}
        <section ref={setRef(6)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(47px,6.5vw,83px)] font-normal leading-[1.1] tracking-[-0.02em] text-[color:var(--siq-fg-deep)]">
              Have an area in mind?
              <br />
              Customer to convince?
              <br />
              Calculate their savings.
            </h2>
          </div>
        </section>

        {/* ── 7: CITY RANKINGS ── */}
        <section ref={setRef(7)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <CityRankings />
          </div>
        </section>

        {/* ── 8: TRANSITION 5 — Capture customers (tan, left) ── */}
        <section ref={setRef(8)} className="siq-snap-section relative overflow-hidden" style={{ background: "#c8b89a" }}>
          {/* dotted orbit rings on the right */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-[45%] opacity-[0.95]">
            <svg className="absolute right-[-120px] top-[-90px] h-[520px] w-[520px]" viewBox="0 0 520 520" fill="none" aria-hidden>
              <circle cx="260" cy="260" r="220" className="siq-dotted-orbit-ring" style={{ stroke: "rgba(42,32,24,0.42)" }} />
              <circle cx="260" cy="260" r="170" className="siq-dotted-orbit-ring siq-dotted-orbit-ring--rev" style={{ stroke: "rgba(53,88,60,0.5)" }} />
              <circle cx="260" cy="260" r="125" className="siq-dotted-orbit-ring" style={{ stroke: "rgba(42,32,24,0.36)" }} />
              <circle cx="260" cy="260" r="84" className="siq-dotted-orbit-ring siq-dotted-orbit-ring--rev" style={{ stroke: "rgba(53,88,60,0.45)" }} />
            </svg>
          </div>

          <div className="relative z-10 flex h-full flex-col justify-center px-16">
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

        {/* ── 10: TRANSITION 6 — See who to target next (sage, left) ── */}
        <section ref={setRef(10)} className="siq-snap-section" style={{ background: "#7a8f68" }}>
          <div className="flex h-full flex-col justify-center px-16">
            <h2 className="siq-tc-title font-serif-siq text-[clamp(47px,6.5vw,86px)] font-normal leading-[1.05] tracking-[-0.02em] text-[#1c2814]">
              See who to target next
            </h2>
            <p className="siq-tc-sub mt-5 max-w-[580px] text-[clamp(20px,2.2vw,26px)] leading-[1.65] text-[#2e3e22]">
              view the number of orphaned units by company over time
            </p>
          </div>
        </section>

        {/* ── 11: LINE RACE ── */}
        <section ref={setRef(11)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <LineRace />
          </div>
          <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-10 py-3 border-t border-[var(--siq-border)]">
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
        .siq-tc-title {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .siq-tc-sub {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1) 0.42s,
                      transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) 0.42s;
        }
        .siq-in .siq-tc-title,
        .siq-in .siq-tc-sub {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
