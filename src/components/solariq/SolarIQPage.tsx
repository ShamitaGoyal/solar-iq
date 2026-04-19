import { useState } from "react";
import { IsoHouse } from "@/components/solariq/IsoHouse";
import { useFadeIn } from "@/components/solariq/useFadeIn";
import { SavingsCalculator } from "@/components/solariq/SavingsCalculator";
import { CityRankings } from "@/components/solariq/CityRankings";
import { Seasonality } from "@/components/solariq/Seasonality";

export function SolarIQPage() {
  useFadeIn();
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

  return (
    <div className="bg-[color:var(--siq-cream)] font-mono-siq text-[color:var(--siq-fg-deep)]">
      {/* NAV */}
      <nav className="siq-fade-in flex h-[52px] items-center bg-[color:var(--siq-cream)] pl-[2.5rem] pr-13">
        <div className="flex items-center gap-[9px] text-[13px] font-medium tracking-[0.07em] text-[color:var(--siq-fg-deep)]">
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
        </div>
      </nav>

      {/* HERO */}
      <section className="grid min-h-[calc(100vh-52px)] grid-cols-1 bg-[color:var(--siq-cream)] md:grid-cols-2">
        <div className="flex flex-col justify-center px-13 pb-13 pt-[4rem]">
          <div className="siq-fade-in mb-7 inline-flex w-fit items-center gap-[7px] rounded-full border border-[rgba(53,88,60,0.22)] px-4 py-1.5">
            <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-[color:var(--siq-fg)]" />
            <span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
              Solar intelligence
            </span>
          </div>
          <h1 className="siq-fade-in mb-5 font-serif-siq text-[68px] font-normal leading-[1.05] tracking-[-0.015em] text-[color:var(--siq-fg-deep)]">
            Your home could
            <br />
            run on <em className="not-italic italic text-[color:var(--siq-fg)]">sunlight.</em>
          </h1>
          <p className="siq-fade-in mb-9 max-w-[400px] text-[14px] font-light leading-[1.85] text-[color:var(--siq-fg-muted)]">
            Enter your zip and electricity bill. We cross-reference real permit data, local irradiance scores, and
            utility rates to show exactly what you'd save.
          </p>
          <div className="siq-fade-in mb-2.5 flex w-full max-w-[480px] border border-[var(--siq-border-strong)]">
            <input
              className="h-12 flex-1 border-r border-[var(--siq-border)] bg-transparent px-4 font-mono-siq text-[13px] text-[color:var(--siq-fg-deep)] outline-none placeholder:text-[color:var(--siq-fg-muted)]"
              placeholder="ZIP code"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
            <input
              className="h-12 flex-1 border-r border-[var(--siq-border)] bg-transparent px-4 font-mono-siq text-[13px] text-[color:var(--siq-fg-deep)] outline-none placeholder:text-[color:var(--siq-fg-muted)]"
              placeholder="Monthly bill $"
              value={billIn}
              onChange={(e) => setBillIn(e.target.value)}
            />
            <button
              onClick={onAnalyze}
              className="h-12 shrink-0 cursor-pointer whitespace-nowrap bg-[color:var(--siq-fg)] px-6 font-mono-siq text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--siq-cream)] transition-colors hover:bg-[color:var(--siq-fg-deep)]"
            >
              Analyze
            </button>
          </div>
          <div
            className="min-h-4 text-[11px] tracking-[0.03em]"
            style={{ color: msg?.ok === false ? "#a04040" : "var(--siq-fg-light)" }}
          >
            {msg?.text}
          </div>
        </div>
        <div className="relative min-h-[520px] overflow-visible bg-[color:var(--siq-cream)]">
          <IsoHouse />
        </div>
      </section>

      {/* SAVINGS CALCULATOR (vis2) */}
      <SavingsCalculator />

      {/* CITY RANKINGS (vis3) */}
      <CityRankings />

      {/* SEASONALITY (vis4) */}
      <Seasonality />

      {/* FOOTER */}
      <footer className="flex items-center justify-between px-13 py-5">
        <span className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
          Solar IQ · DataHacks 2026
        </span>
        <span className="text-[10px] text-[color:var(--siq-fg-muted)]">
          Powered by Gemini · NREL · EIA · Zen Power Dataset
        </span>
      </footer>
    </div>
  );
}
