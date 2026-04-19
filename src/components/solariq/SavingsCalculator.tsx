import { useMemo, useState, useEffect, useRef } from "react";
import { ZIP_DATA } from "@/data/zipData";

const fmt = (n: number) => Math.round(n).toLocaleString();

export function SavingsCalculator() {
  const [zip, setZip] = useState("");
  const [bill, setBill] = useState(200);
  const [pulseKey, setPulseKey] = useState(0);
  const prevAnnualRef = useRef<number | null>(null);

  const lookup = useMemo(() => {
    const z = zip.trim();
    if (z.length < 5) return { status: "empty" as const };
    if (ZIP_DATA[z]) return { status: "found" as const, key: z, data: ZIP_DATA[z] };
    const found = Object.keys(ZIP_DATA).find(
      (k) => k.trim() === z || k.replace(/\s/g, "") === z,
    );
    if (found) return { status: "found" as const, key: found, data: ZIP_DATA[found] };
    return { status: "not-found" as const };
  }, [zip]);

  const result = useMemo(() => {
    if (lookup.status !== "found") return null;
    const d = lookup.data;
    const annualSpend = bill * 12;
    const annual = annualSpend * (d.offset / 100);
    return {
      d,
      key: lookup.key,
      annual,
      monthly: annual / 12,
    };
  }, [lookup, bill]);

  useEffect(() => {
    if (result && prevAnnualRef.current !== result.annual) {
      prevAnnualRef.current = result.annual;
      setPulseKey((k) => k + 1);
    }
  }, [result]);

  const zipStatusText =
    lookup.status === "empty"
      ? zip.length === 0
        ? "Enter ZIP to begin"
        : "Enter 5-digit ZIP"
      : lookup.status === "found"
        ? `✓ ${lookup.data.city}, ${lookup.data.state}`
        : "ZIP not in dataset";

  const zipStatusColor =
    lookup.status === "found"
      ? "#4a7a3a"
      : lookup.status === "not-found"
        ? "#a05030"
        : "var(--siq-fg-muted)";

  return (
    <section className="siq-fade-in border-b border-[rgba(53,88,60,0.1)] px-13 py-13">
      {/* HEADER */}
      <div className="mb-3 flex items-baseline justify-between border-b border-[rgba(53,88,60,0.1)] pb-5">
        <div className="text-[9px] uppercase tracking-[0.2em] text-[color:var(--siq-fg-muted)]">
          Q1 Solar Performance · 1,017 ZIP Codes
        </div>
        <h2 className="font-serif-siq text-[clamp(32px,4vw,56px)] font-normal leading-[1.05]">
          Potential <em className="not-italic italic text-[color:var(--siq-fg)]">Savings</em> Calculator
        </h2>
      </div>

      {/* METHODOLOGY */}
      <div className="mb-9 flex flex-col gap-5 border-b border-[rgba(53,88,60,0.1)] pb-9 pt-5 md:flex-row md:gap-12">
        {[
          {
            n: "01",
            t: "Your Bill → kWh",
            d: "Monthly dollar spend converts to kilowatt-hours using your ZIP's local utility rate.",
            f: "Monthly $ ÷ rate = kWh",
          },
          {
            n: "02",
            t: "ZIP Solar Profile",
            d: "Each ZIP carries a precomputed offset % from real installations — irradiance, system size, efficiency.",
            f: "avg_pct_consumption_offset",
          },
          {
            n: "03",
            t: "Personalized Savings",
            d: "Offset % applied to your actual annual spend — not a national average household.",
            f: "offset% × (bill × 12)",
          },
        ].map((s) => (
          <div key={s.n} className="flex flex-1 items-start gap-3">
            <div className="font-serif-siq text-[28px] leading-none text-[rgba(53,88,60,0.3)]">
              {s.n}
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
                {s.t}
              </div>
              <div className="text-[11px] leading-[1.65] text-[color:var(--siq-fg-muted)]">
                {s.d}
                <div className="mt-1.5 inline-block border-l-2 border-[color:var(--siq-fg)] pl-2 italic text-[color:var(--siq-fg)]">
                  {s.f}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CALC GRID */}
      <div className="grid min-h-[560px] grid-cols-1 border border-[rgba(53,88,60,0.2)] md:grid-cols-2">
        {/* LEFT */}
        <div className="flex flex-col overflow-hidden border-b border-[rgba(53,88,60,0.2)] md:border-b-0 md:border-r">
          <div className="flex-1 px-11 py-10">
            <div className="mb-9">
              <label className="mb-3 block text-[9px] uppercase tracking-[0.18em] text-[color:var(--siq-fg-muted)]">
                Your ZIP Code
              </label>
              <div className="flex items-stretch border border-[rgba(53,88,60,0.2)]">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="e.g. 92101"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  className="w-[150px] bg-transparent px-4 py-3 font-mono-siq text-[26px] tracking-[0.1em] text-[color:var(--siq-fg-deep)] outline-none"
                />
                <div
                  className="flex flex-1 items-center border-l border-[rgba(53,88,60,0.1)] px-4 text-[11px] leading-[1.4]"
                  style={{ color: zipStatusColor }}
                >
                  {zipStatusText}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-[9px] uppercase tracking-[0.18em] text-[color:var(--siq-fg-muted)]">
                Monthly Electricity Bill
              </label>
              <div className="mb-4 font-serif-siq text-[52px] leading-none text-[color:var(--siq-fg-deep)]">
                ${bill}
                <span className="ml-1 text-[22px] italic text-[color:var(--siq-fg-light)]"> /mo</span>
              </div>
              <input
                type="range"
                min={50}
                max={800}
                step={10}
                value={bill}
                onChange={(e) => setBill(parseInt(e.target.value, 10))}
                className="siq-range"
              />
              <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
                <span>$50 / mo</span>
                <span>$800 / mo</span>
              </div>
            </div>
          </div>

          {/* TREE GARDEN */}
          <div
            className="relative h-[200px] flex-shrink-0 overflow-hidden border-t border-[rgba(53,88,60,0.1)]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(53,88,60,0.04) 0%, rgba(53,88,60,0.10) 100%)",
            }}
          >
            <div className="absolute bottom-[38px] left-0 right-0 h-px bg-[rgba(53,88,60,0.2)]" />
            <svg
              viewBox="0 0 680 200"
              preserveAspectRatio="xMidYMax meet"
              className="absolute bottom-0 left-0 h-full w-full"
            >
              <rect x="0" y="162" width="680" height="38" fill="rgba(53,88,60,0.07)" />
              {/* BG trees */}
              <ellipse cx="60" cy="118" rx="22" ry="26" fill="rgba(74,122,58,0.18)" />
              <rect x="57" y="138" width="6" height="24" fill="rgba(100,80,50,0.18)" />
              <ellipse cx="130" cy="112" rx="18" ry="22" fill="rgba(74,122,58,0.15)" />
              <rect x="127" y="130" width="6" height="32" fill="rgba(100,80,50,0.15)" />
              <polygon points="610,100 625,138 595,138" fill="rgba(53,88,60,0.15)" />
              <polygon points="610,115 621,138 599,138" fill="rgba(53,88,60,0.12)" />
              <rect x="607" y="138" width="6" height="24" fill="rgba(80,60,40,0.15)" />
              <ellipse cx="650" cy="115" rx="20" ry="24" fill="rgba(74,122,58,0.18)" />
              <ellipse cx="640" cy="122" rx="14" ry="18" fill="rgba(53,88,60,0.12)" />
              <rect x="647" y="133" width="6" height="29" fill="rgba(100,80,50,0.18)" />
              {/* MID */}
              <ellipse cx="200" cy="108" rx="30" ry="34" fill="#6aaa58" opacity="0.55" />
              <ellipse cx="188" cy="116" rx="20" ry="22" fill="#4a7a3a" opacity="0.45" />
              <rect x="196" y="136" width="8" height="26" rx="1" fill="#7a5c3a" opacity="0.7" />
              <circle cx="310" cy="105" r="22" fill="#5a9448" opacity="0.6" />
              <circle cx="297" cy="112" r="16" fill="#4a7a3a" opacity="0.5" />
              <circle cx="323" cy="110" r="18" fill="#6aaa58" opacity="0.45" />
              <rect x="307" y="130" width="7" height="32" rx="1" fill="#7a5c3a" opacity="0.65" />
              <ellipse cx="420" cy="100" rx="18" ry="40" fill="#35583C" opacity="0.65" />
              <ellipse cx="420" cy="106" rx="14" ry="32" fill="#4a7a3a" opacity="0.35" />
              <rect x="416" y="138" width="8" height="24" rx="1" fill="#7a5c3a" opacity="0.6" />
              <circle cx="530" cy="116" r="20" fill="#5a9448" opacity="0.55" />
              <circle cx="514" cy="122" r="16" fill="#4a7a3a" opacity="0.5" />
              <circle cx="546" cy="120" r="17" fill="#6aaa58" opacity="0.45" />
              <circle cx="530" cy="104" r="14" fill="#4a7a3a" opacity="0.4" />
              <rect x="525" y="134" width="10" height="28" rx="1" fill="#7a5c3a" opacity="0.6" />
              {/* FG */}
              <polygon points="90,68 112,130 68,130" fill="#35583C" opacity="0.82" />
              <polygon points="90,85 108,130 72,130" fill="#4a7a3a" opacity="0.6" />
              <polygon points="90,100 105,130 75,130" fill="#35583C" opacity="0.5" />
              <rect x="86" y="130" width="8" height="32" rx="1" fill="#6b4f2e" opacity="0.75" />
              <polygon points="90,68 112,130 90,130" fill="#2a4530" opacity="0.25" />
              <ellipse cx="240" cy="90" rx="36" ry="40" fill="#4a7a3a" opacity="0.85" />
              <ellipse cx="222" cy="100" rx="24" ry="26" fill="#35583C" opacity="0.6" />
              <ellipse cx="256" cy="96" rx="26" ry="30" fill="#5a9448" opacity="0.5" />
              <rect x="236" y="124" width="9" height="38" rx="1" fill="#6b4f2e" opacity="0.8" />
              <rect x="373" y="80" width="6" height="82" rx="2" fill="#6b4f2e" opacity="0.7" />
              <ellipse cx="370" cy="86" rx="20" ry="22" fill="#6aaa58" opacity="0.7" />
              <ellipse cx="356" cy="94" rx="14" ry="16" fill="#4a7a3a" opacity="0.6" />
              <ellipse cx="384" cy="92" rx="16" ry="18" fill="#5a9448" opacity="0.55" />
              <rect x="468" y="118" width="5" height="44" rx="1" fill="#7a5c3a" opacity="0.7" />
              <ellipse cx="462" cy="112" rx="8" ry="6" fill="#6aaa58" opacity="0.75" />
              <ellipse cx="476" cy="108" rx="7" ry="5" fill="#5a9448" opacity="0.7" />
              <ellipse cx="469" cy="104" rx="6" ry="5" fill="#4a7a3a" opacity="0.75" />
              <polygon points="580,58 608,138 552,138" fill="#35583C" opacity="0.85" />
              <polygon points="580,78 604,138 556,138" fill="#4a7a3a" opacity="0.55" />
              <polygon points="580,98 601,138 559,138" fill="#35583C" opacity="0.4" />
              <rect x="575" y="138" width="10" height="24" rx="1" fill="#6b4f2e" opacity="0.75" />
              <polygon points="580,58 608,138 580,138" fill="#2a4530" opacity="0.22" />
              <ellipse cx="160" cy="160" rx="12" ry="5" fill="#4a7a3a" opacity="0.4" />
              <ellipse cx="340" cy="160" rx="10" ry="4" fill="#5a9448" opacity="0.35" />
              <ellipse cx="500" cy="162" rx="14" ry="5" fill="#4a7a3a" opacity="0.3" />
            </svg>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex flex-col justify-center overflow-hidden bg-[color:var(--siq-fg)] px-12 py-11">
          {/* Orbs */}
          <div className="pointer-events-none absolute -right-[60px] -top-[60px] h-[280px] w-[280px] rounded-full bg-white/[0.055] [animation:siq-orb1_14s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute -left-[40px] bottom-10 h-[160px] w-[160px] rounded-full bg-white/[0.038] [animation:siq-orb2_18s_ease-in-out_infinite]" />
          <div className="pointer-events-none absolute left-[55%] top-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(168,232,144,0.08)]" />
          <div className="pointer-events-none absolute bottom-20 right-20 h-[50px] w-[50px] rounded-full bg-[rgba(168,232,144,0.06)]" />

          {!result ? (
            <div className="relative flex h-full flex-col items-start justify-center gap-4">
              <div className="text-[28px] text-white/20 [animation:siq-bounce-left_1.8s_ease-in-out_infinite]">
                ←
              </div>
              <p className="max-w-[260px] text-[13px] leading-[1.75] text-white/40">
                Enter your ZIP code and drag the slider to see your personalized solar savings estimate.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="mb-7 text-[9px] uppercase tracking-[0.18em] text-white/45">
                {result.d.city}, {result.d.state} · ZIP {result.key}
              </div>
              <div className="mb-10">
                <div className="mb-2 text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Estimated Annual Savings
                </div>
                <div
                  key={pulseKey}
                  className="font-serif-siq text-[80px] leading-[0.95] text-[#a8e890] [animation:siq-pulse_0.3s_ease_both]"
                >
                  <span className="align-super text-[32px] italic text-[#a8e890]/65">$</span>
                  {fmt(result.annual)}
                </div>
              </div>

              <div className="relative mb-7 grid grid-cols-2 border border-white/10">
                {[
                  { val: "$" + fmt(result.monthly), lbl: "Per Month" },
                  { val: result.d.offset.toFixed(1) + "%", lbl: "Bill Offset" },
                  { val: result.d.kw.toFixed(1) + " kW", lbl: "Avg System" },
                  { val: result.d.tilt.toFixed(2), lbl: "Peak Sun Hrs" },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="border-b border-r border-white/10 px-5 py-4 last:border-r-0 [&:nth-child(even)]:border-r-0 [&:nth-child(3)]:border-b-0 [&:nth-child(4)]:border-b-0"
                  >
                    <div className="font-serif-siq text-[26px] leading-none text-[color:var(--siq-cream)]">
                      {c.val}
                    </div>
                    <div className="mt-1 text-[9px] uppercase tracking-[0.13em] text-white/40">
                      {c.lbl}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="mb-2 text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Consumption Offset
                </div>
                <div className="h-1 overflow-hidden bg-white/10">
                  <div
                    className="h-full bg-[#a8e890] transition-[width] duration-700 ease-out"
                    style={{ width: `${Math.min(result.d.offset, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
