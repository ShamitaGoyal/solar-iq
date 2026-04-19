import { useEffect, useRef, useState } from "react";
import { IsoHouse } from "@/components/solariq/IsoHouse";
import { SavingsCalculator } from "@/components/solariq/SavingsCalculator";
import { CityRankings } from "@/components/solariq/CityRankings";
import { Seasonality } from "@/components/solariq/Seasonality";
import { SavingsAtlas } from "@/components/solariq/SavingsAtlas";
import { LineRace } from "@/components/solariq/LineRace";

const SECTIONS = [
  { label: "Home" },
  { label: "Atlas" },
  { label: "Calculator" },
  { label: "Cities" },
  { label: "Seasons" },
  { label: "Installers" },
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

  // Track active section via IntersectionObserver on the scroll container
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
        // Also trigger fade-ins inside newly visible sections
        document.querySelectorAll<HTMLElement>(".siq-fade-in:not(.siq-show)").forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add("siq-show");
          }
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

  return (
    <div
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      className="text-[color:var(--siq-fg-deep)]"
    >
      {/* Fixed nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between bg-[color:var(--siq-cream)]/90 px-10 backdrop-blur-sm border-b border-[var(--siq-border)]">
        <button
          onClick={() => scrollToSection(0)}
          className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.06em] text-[color:var(--siq-fg-deep)]"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color:var(--siq-fg)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
          {SECTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => scrollToSection(i)}
              className="transition-colors hover:text-[color:var(--siq-fg)]"
              style={{ color: activeIdx === i ? "var(--siq-fg)" : undefined, fontWeight: activeIdx === i ? 500 : undefined }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Dot nav */}
      <div className="fixed right-5 top-1/2 z-50 -translate-y-1/2 flex flex-col gap-3">
        {SECTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            title={s.label}
            className="group relative flex items-center justify-end"
          >
            <span className="mr-2 hidden text-[10px] font-medium uppercase tracking-[0.1em] text-[color:var(--siq-fg)] opacity-0 transition-opacity group-hover:opacity-100">
              {s.label}
            </span>
            <span
              className="block rounded-full transition-all duration-300"
              style={{
                width: activeIdx === i ? 10 : 6,
                height: activeIdx === i ? 10 : 6,
                background: activeIdx === i ? "var(--siq-fg)" : "rgba(53,88,60,0.3)",
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
            <div className="flex flex-col justify-center px-12 py-10">
              <div className="siq-section-content mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(53,88,60,0.22)] px-4 py-1.5">
                <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-[color:var(--siq-fg)]" />
                <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
                  Solar intelligence
                </span>
              </div>
              <h1 className="siq-section-content mb-5 font-serif-siq text-[clamp(44px,5.5vw,72px)] font-normal leading-[1.05] tracking-[-0.015em] text-[color:var(--siq-fg-deep)]">
                Your home could
                <br />
                run on <em className="not-italic italic text-[color:var(--siq-fg)]">sunlight.</em>
              </h1>
              <p className="siq-section-content mb-8 max-w-[400px] text-[16px] leading-[1.75] text-[color:var(--siq-fg-muted)]">
                Cross-reference real permit data, local irradiance scores, and utility rates to see exactly what you'd save.
              </p>
              <div className="siq-section-content mb-2.5 flex w-full max-w-[480px] border border-[var(--siq-border-strong)]">
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
              </div>
              <div className="min-h-5 text-[13px]" style={{ color: msg?.ok === false ? "#a04040" : "var(--siq-fg-light)" }}>
                {msg?.text}
              </div>
            </div>
            <div className="relative overflow-hidden bg-[color:var(--siq-cream)] pt-12">
              <IsoHouse />
            </div>
          </div>
          {/* Scroll cue */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
            <span className="font-mono-siq text-[10px] uppercase tracking-[0.2em] text-[color:var(--siq-fg-muted)]">scroll</span>
            <div className="h-6 w-px bg-[color:var(--siq-fg-muted)]" style={{ animation: "siq-bounce-left 1.8s ease-in-out infinite", animationName: "scrollBounce" }} />
          </div>
        </section>

        {/* ── 1: ATLAS ── */}
        <section ref={setRef(1)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <SavingsAtlas />
          </div>
        </section>

        {/* ── 2: CALCULATOR ── */}
        <section ref={setRef(2)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <SavingsCalculator />
          </div>
        </section>

        {/* ── 3: CITY RANKINGS ── */}
        <section ref={setRef(3)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <CityRankings />
          </div>
        </section>

        {/* ── 4: SEASONALITY ── */}
        <section ref={setRef(4)} className="siq-snap-section" style={{ background: "#35583C" }}>
          <div className="siq-section-content h-full pt-12">
            <Seasonality />
          </div>
        </section>

        {/* ── 5: LINE RACE ── */}
        <section ref={setRef(5)} className="siq-snap-section bg-[color:var(--siq-cream)]">
          <div className="siq-section-content h-full pt-12">
            <LineRace />
          </div>
          {/* Footer inside last section */}
          <footer className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-10 py-3 border-t border-[var(--siq-border)]">
            <span className="font-mono-siq text-[11px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
              Solar IQ · DataHacks 2026
            </span>
            <span className="font-mono-siq text-[11px] text-[color:var(--siq-fg-muted)]">
              Powered by Gemini · NREL · EIA · Zen Power Dataset
            </span>
          </footer>
        </section>

      </div>

      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.4); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
