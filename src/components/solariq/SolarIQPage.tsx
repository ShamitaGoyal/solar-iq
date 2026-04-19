import { useState } from "react";
import { IsoHouse } from "@/components/solariq/IsoHouse";
import { useFadeIn } from "@/components/solariq/useFadeIn";

const CITIES = [
  { n: "San Diego", p: 18420, pct: 100 },
  { n: "Los Angeles", p: 15104, pct: 82 },
  { n: "Phoenix", p: 11790, pct: 64 },
  { n: "Sacramento", p: 9380, pct: 51 },
  { n: "Las Vegas", p: 7360, pct: 40 },
  { n: "Riverside", p: 5890, pct: 32 },
];
const MH = [38, 44, 62, 70, 95, 100, 88, 80, 65, 52, 41, 35];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const INSTALLERS = [
  { n: "Solar City", v: 38, w: 100 },
  { n: "SunRun", v: 27, w: 71 },
  { n: "Freedom Forever", v: 19, w: 50 },
  { n: "Sullivan Solar", v: 11, w: 29 },
  { n: "Titan", v: 5, w: 13 },
];

function calc(b: number) {
  const s = Math.round(b * 0.7);
  const cost = Math.round(s * 12 * 8.5);
  const pay = (cost / (s * 12)).toFixed(1);
  const kw = (b / 19).toFixed(1);
  return { s, pay, kw, ten: (s * 120).toLocaleString() };
}

export function SolarIQPage() {
  useFadeIn();
  const [bill, setBill] = useState(150);
  const [zip, setZip] = useState("");
  const [billIn, setBillIn] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const c = calc(bill);

  const onAnalyze = () => {
    if (zip.trim().length === 5 && billIn.trim()) {
      const v = parseInt(billIn, 10);
      setBill(v);
      setMsg({ text: `ZIP ${zip} analyzed — est. $${Math.round(v * 0.7)}/mo savings.`, ok: true });
    } else {
      setMsg({ text: "Enter a 5-digit ZIP and monthly bill.", ok: false });
    }
  };

  return (
    <div className="bg-[color:var(--siq-cream)] font-mono-siq text-[color:var(--siq-fg-deep)]">
      {/* NAV */}
      <nav className="siq-fade-in flex h-[52px] items-center bg-[color:var(--siq-cream)] px-13">
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
        <div className="flex flex-col justify-center px-13 pb-13 pt-16">
          <div className="siq-fade-in mb-7 inline-flex w-fit items-center gap-[7px] rounded-full border border-[rgba(53,88,60,0.22)] px-4 py-1.5">
            <div className="h-[5px] w-[5px] shrink-0 rounded-full bg-[color:var(--siq-fg)]" />
            <span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
              Solar intelligence
            </span>
          </div>
          <h1 className="siq-fade-in mb-5 font-serif-siq text-[56px] font-normal leading-[1.1] tracking-[-0.015em] text-[color:var(--siq-fg-deep)]">
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

      {/* STAT STRIP */}
      <div className="siq-fade-in grid grid-cols-2 border-t border-[rgba(53,88,60,0.15)] bg-[color:var(--siq-fg)] md:grid-cols-4">
        {[
          { lbl: "Total permits", val: "84,291", d: "+12% this year" },
          { lbl: "Avg system size", val: "7.2 kW", d: "+0.4 kW vs last yr" },
          { lbl: "Avg monthly savings", val: "$138", d: "Per household" },
          { lbl: "CO₂ offset this year", val: "142k t", d: "Across all installs" },
        ].map((s, i) => (
          <div key={i} className="border-r border-white/10 px-7 py-[22px] last:border-r-0">
            <div className="mb-1.5 text-[9px] uppercase tracking-[0.12em] text-[color:var(--siq-cream)]/50">
              {s.lbl}
            </div>
            <div className="text-[22px] font-medium tracking-[-0.01em] text-[color:var(--siq-cream)]">{s.val}</div>
            <div className="mt-0.5 text-[10px] text-[color:var(--siq-cream)]/40">{s.d}</div>
          </div>
        ))}
      </div>

      {/* CALCULATOR */}
      <section className="siq-fade-in border-b border-[rgba(53,88,60,0.1)] px-13 py-13">
        <div className="mb-1.5 text-[9px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
          Savings calculator
        </div>
        <div className="mb-1 font-serif-siq text-[30px] font-normal text-[color:var(--siq-fg-deep)]">
          How much could <em className="not-italic italic text-[color:var(--siq-fg)]">you</em> save?
        </div>
        <p className="mb-[22px] text-[11px] leading-[1.7] text-[color:var(--siq-fg-muted)]">
          Adjust your monthly bill to see personalized estimates
        </p>
        <div className="mb-[9px] flex justify-between text-[11px] text-[color:var(--siq-fg-muted)]">
          Monthly electricity bill <span className="font-medium text-[color:var(--siq-fg-deep)]">${bill}</span>
        </div>
        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={bill}
          onChange={(e) => setBill(parseInt(e.target.value, 10))}
          className="siq-range mb-[22px]"
        />
        <div className="grid grid-cols-2 border border-[rgba(53,88,60,0.15)] md:grid-cols-4">
          {[
            { lbl: "Monthly savings", val: `$${c.s}`, g: true },
            { lbl: "10-year total", val: `$${c.ten}` },
            { lbl: "Payback period", val: `${c.pay} yrs` },
            { lbl: "System size", val: `${c.kw} kW` },
          ].map((cg, i) => (
            <div key={i} className="border-r border-[rgba(53,88,60,0.1)] px-[18px] py-4 last:border-r-0">
              <div className="mb-1.5 text-[9px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
                {cg.lbl}
              </div>
              <div
                className="text-[20px] font-medium"
                style={{ color: cg.g ? "var(--siq-fg)" : "var(--siq-fg-deep)" }}
              >
                {cg.val}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TWO COL */}
      <div className="grid grid-cols-1 border-b border-[rgba(53,88,60,0.1)] md:grid-cols-2">
        <div className="siq-fade-in border-b border-[rgba(53,88,60,0.1)] p-13 md:border-b-0 md:border-r">
          <div className="mb-1.5 text-[9px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
            Top markets
          </div>
          <div className="mb-1 font-serif-siq text-[30px] font-normal text-[color:var(--siq-fg-deep)]">
            <em className="not-italic italic text-[color:var(--siq-fg)]">Where</em> solar is growing
          </div>
          <p className="mb-[22px] text-[11px] leading-[1.7] text-[color:var(--siq-fg-muted)]">
            Permit volume — unified installer dataset
          </p>
          <div>
            {CITIES.map((city) => (
              <div key={city.n} className="mb-[13px] flex items-center gap-2.5">
                <div className="w-[90px] shrink-0 text-[11px] text-[color:var(--siq-fg-muted)]">{city.n}</div>
                <div className="relative h-px flex-1 bg-[rgba(53,88,60,0.1)]">
                  <div
                    className="absolute left-0 top-0 h-px bg-[color:var(--siq-fg)]"
                    style={{ width: `${city.pct}%` }}
                  />
                </div>
                <div className="w-[52px] text-right text-[11px] font-medium text-[color:var(--siq-fg-deep)]">
                  {city.p.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="siq-fade-in p-13">
          <div className="mb-1.5 text-[9px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
            Seasonality
          </div>
          <div className="mb-1 font-serif-siq text-[30px] font-normal text-[color:var(--siq-fg-deep)]">
            <em className="not-italic italic text-[color:var(--siq-fg)]">When</em> do people switch?
          </div>
          <p className="mb-[22px] text-[11px] leading-[1.7] text-[color:var(--siq-fg-muted)]">
            Monthly permit filings from apply_date
          </p>
          <div className="flex h-20 items-end gap-[3px]">
            {MH.map((h, i) => {
              const bg = h >= 90 ? "#35583C" : h >= 60 ? "#4a7a52" : "#c5dcc7";
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-[1px]"
                  style={{ height: `${h}%`, background: bg }}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex gap-[3px]">
            {MONTHS.map((m, i) => (
              <div key={i} className="flex-1 text-center text-[9px] uppercase text-[color:var(--siq-fg-muted)]">
                {m}
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex gap-3.5">
            {[
              { c: "#35583C", l: "Peak" },
              { c: "#4a7a52", l: "High" },
              { c: "#c5dcc7", l: "Low" },
            ].map((it) => (
              <div key={it.l} className="flex items-center gap-1.5 text-[10px] text-[color:var(--siq-fg-muted)]">
                <div className="h-2 w-2 rounded-[1px]" style={{ background: it.c }} />
                {it.l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INSTALLERS */}
      <section className="siq-fade-in border-b border-[rgba(53,88,60,0.1)] px-13 py-13">
        <div className="mb-1.5 text-[9px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
          Installer breakdown
        </div>
        <div className="mb-1 font-serif-siq text-[30px] font-normal text-[color:var(--siq-fg-deep)]">
          Who's <em className="not-italic italic text-[color:var(--siq-fg)]">doing the work</em>
        </div>
        <p className="mb-[22px] text-[11px] leading-[1.7] text-[color:var(--siq-fg-muted)]">
          Market share by permit volume — all sources merged
        </p>
        <div className="grid grid-cols-2 border border-[rgba(53,88,60,0.15)] sm:grid-cols-3 md:grid-cols-5">
          {INSTALLERS.map((inst) => (
            <div
              key={inst.n}
              className="border-r border-[rgba(53,88,60,0.08)] px-4 py-[18px] last:border-r-0"
            >
              <div className="mb-2 text-[9px] uppercase tracking-[0.09em] text-[color:var(--siq-fg-muted)]">
                {inst.n}
              </div>
              <div className="mb-2 text-[22px] font-medium text-[color:var(--siq-fg-deep)]">{inst.v}%</div>
              <div className="h-0.5 bg-[rgba(53,88,60,0.1)]">
                <div className="h-0.5 bg-[color:var(--siq-fg)]" style={{ width: `${inst.w}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WRAPPED */}
      <section className="siq-fade-in flex flex-col items-start justify-between gap-6 border-b border-[rgba(53,88,60,0.1)] bg-[color:var(--siq-cream-soft)] p-13 md:flex-row md:items-center">
        <div>
          <div className="mb-2 text-[9px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
            Coming up
          </div>
          <div className="mb-1 font-serif-siq text-[32px] font-normal text-[color:var(--siq-fg-deep)]">
            Your <em className="not-italic italic text-[color:var(--siq-fg)]">solar year</em> in review
          </div>
          <div className="text-[11px] text-[color:var(--siq-fg-muted)]">
            Scroll to the end for your personalized wrapped summary
          </div>
        </div>
        <button className="h-11 cursor-pointer bg-[color:var(--siq-fg)] px-7 font-mono-siq text-[10px] font-medium uppercase tracking-[0.12em] text-[color:var(--siq-cream)] transition-colors hover:bg-[color:var(--siq-fg-deep)]">
          See my wrapped
        </button>
      </section>

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
