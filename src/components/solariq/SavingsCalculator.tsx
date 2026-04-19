import { useMemo, useState, useEffect, useRef } from "react";
import { ZIP_DATA } from "@/data/zipData";
import { ZIP_CITY_FALLBACK } from "@/data/zipCityFallback";
import { SavingsCalculatorTreeGarden } from "./SavingsCalculatorTreeGarden";

type ZipRow = (typeof ZIP_DATA)[string];

export type ZipLookup =
  | { status: "empty" }
  | { status: "found"; key: string; data: ZipRow }
  | {
      status: "city-fallback";
      key: string;
      data: ZipRow;
      originalCity: string;
      originalState: string;
      originalZip: string;
    }
  | { status: "not-found" };

export type SavingsResult = {
  d: ZipRow;
  key: string;
  annual: number;
  monthly: number;
  isFallback: boolean;
  originalCity?: string;
  originalZip?: string;
};

const fmt = (n: number) => Math.round(n).toLocaleString();

const COUNT_DURATION_MS = 880;

/** Resolve ZIP input to dataset row (direct, city fallback, or miss). */
export function computeZipLookup(zip: string): ZipLookup {
  const z = zip.trim();
  if (z.length < 5) return { status: "empty" };

  const direct = ZIP_DATA[z] ?? ZIP_DATA[z.padStart(5, "0")];
  const directKey = ZIP_DATA[z] ? z : z.padStart(5, "0");
  if (direct) return { status: "found", key: directKey, data: direct };

  const cityState = ZIP_CITY_FALLBACK[z] ?? ZIP_CITY_FALLBACK[z.padStart(5, "0")];
  if (cityState) {
    const [city, state] = cityState.split(",");
    const match = Object.entries(ZIP_DATA).find(
      ([, d]) => d.city.toLowerCase() === city.toLowerCase() && d.state === state,
    );
    if (match) {
      return {
        status: "city-fallback",
        key: match[0],
        data: match[1],
        originalCity: city,
        originalState: state,
        originalZip: z,
      };
    }
  }

  return { status: "not-found" };
}

/** Annual / monthly savings from matched ZIP row and monthly bill. */
export function computeSavingsResult(lookup: ZipLookup, bill: number): SavingsResult | null {
  if (lookup.status !== "found" && lookup.status !== "city-fallback") return null;
  const d = lookup.data;
  const annualSpend = bill * 12;
  const annual = annualSpend * (d.offset / 100);
  return {
    d,
    key: lookup.key,
    annual,
    monthly: annual / 12,
    isFallback: lookup.status === "city-fallback",
    originalCity: lookup.status === "city-fallback" ? lookup.originalCity : undefined,
    originalZip: lookup.status === "city-fallback" ? lookup.originalZip : undefined,
  };
}

function zipStatusFromLookup(zip: string, lookup: ZipLookup): { text: string; color: string } {
  const text =
    lookup.status === "empty"
      ? zip.length === 0
        ? "Enter ZIP to begin"
        : "Enter 5-digit ZIP"
      : lookup.status === "found"
        ? `✓ ${lookup.data.city}, ${lookup.data.state}`
        : lookup.status === "city-fallback"
          ? `~ Nearest data: ${lookup.data.city}, ${lookup.data.state}`
          : "ZIP not in dataset";

  const color =
    lookup.status === "found"
      ? "#4a7a3a"
      : lookup.status === "city-fallback"
        ? "#7a6a30"
        : lookup.status === "not-found"
          ? "#a05030"
          : "var(--siq-fg-muted)";

  return { text, color };
}

/** ZIP + bill state, derived lookup/result, count-up animation for annual savings. */
function useSavingsCalculator() {
  const [zip, setZip] = useState("");
  const [bill, setBill] = useState(200);
  const [pulseKey, setPulseKey] = useState(0);
  const [displayAnnual, setDisplayAnnual] = useState(0);
  const countRafRef = useRef<number | null>(null);
  const displayAnnualRef = useRef(0);
  const prevZipKeyAnimRef = useRef<string | null>(null);

  const lookup = useMemo(() => computeZipLookup(zip), [zip]);
  const result = useMemo(() => computeSavingsResult(lookup, bill), [lookup, bill]);
  const { text: zipStatusText, color: zipStatusColor } = useMemo(
    () => zipStatusFromLookup(zip, lookup),
    [zip, lookup],
  );

  useEffect(() => {
    displayAnnualRef.current = displayAnnual;
  }, [displayAnnual]);

  useEffect(() => {
    if (countRafRef.current != null) {
      cancelAnimationFrame(countRafRef.current);
      countRafRef.current = null;
    }

    if (!result) {
      setDisplayAnnual(0);
      prevZipKeyAnimRef.current = null;
      return;
    }

    const target = result.annual;
    const zipKey = result.key;
    const zipChanged = prevZipKeyAnimRef.current !== zipKey;
    const from = zipChanged ? 0 : displayAnnualRef.current;
    prevZipKeyAnimRef.current = zipKey;

    const reduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayAnnual(target);
      setPulseKey((k) => k + 1);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_DURATION_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      const v = from + (target - from) * eased;
      setDisplayAnnual(v);
      if (t < 1) {
        countRafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayAnnual(target);
        countRafRef.current = null;
        setPulseKey((k) => k + 1);
      }
    };
    countRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (countRafRef.current != null) {
        cancelAnimationFrame(countRafRef.current);
        countRafRef.current = null;
      }
    };
  }, [result]);

  return {
    zip,
    setZip,
    bill,
    setBill,
    result,
    displayAnnual,
    pulseKey,
    zipStatusText,
    zipStatusColor,
  };
}

function SavingsCalculatorHeroOrbs() {
  return (
    <>
      <div className="pointer-events-none absolute -right-[60px] -top-[60px] h-[280px] w-[280px] rounded-full bg-white/[0.055] [animation:siq-orb1_14s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -left-[40px] bottom-10 h-[160px] w-[160px] rounded-full bg-white/[0.038] [animation:siq-orb2_18s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute left-[55%] top-1/2 h-[90px] w-[90px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgba(168,232,144,0.08)]" />
      <div className="pointer-events-none absolute bottom-20 right-20 h-[50px] w-[50px] rounded-full bg-[rgba(168,232,144,0.06)]" />
    </>
  );
}

function SavingsCalculatorResultsBody({
  result,
  displayAnnual,
  pulseKey,
}: {
  result: SavingsResult;
  displayAnnual: number;
  pulseKey: number;
}) {
  return (
    <div className="relative">
      <div className="mb-7 text-[12px] uppercase tracking-[0.18em] text-white/45">
        {result.d.city}, {result.d.state} · ZIP {result.key}
        {result.isFallback && (
          <div className="mt-1 text-[13px] normal-case tracking-[0.06em] text-white/35">
            Nearest available data for {result.originalCity} (ZIP {result.originalZip})
          </div>
        )}
      </div>
      <div className="mb-10">
        <div className="mb-2 text-[12px] uppercase tracking-[0.15em] text-white/40">Estimated Annual Savings</div>
        <div
          key={pulseKey}
          className="font-sans-siq text-[80px] leading-[0.95] text-[#a8e890] [animation:siq-pulse_0.35s_ease_both]"
        >
          <span className="align-super text-[32px] italic text-[#a8e890]/65">$</span>
          {fmt(displayAnnual)}
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
            <div className="font-sans-siq text-[26px] leading-none text-[color:var(--siq-cream)]">{c.val}</div>
            <div className="mt-1 text-[12px] uppercase tracking-[0.13em] text-white/40">{c.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Left column: ZIP + bill controls and illustration. */
function SavingsCalculatorInputsColumn({
  zip,
  setZip,
  bill,
  setBill,
  zipStatusText,
  zipStatusColor,
}: {
  zip: string;
  setZip: (v: string) => void;
  bill: number;
  setBill: (v: number) => void;
  zipStatusText: string;
  zipStatusColor: string;
}) {
  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex-1 px-11 py-10">
        <div className="mb-9">
          <label className="mb-3 block text-[12px] uppercase tracking-[0.18em] text-[color:var(--siq-fg-muted)]">
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
              className="w-[150px] bg-transparent px-4 py-3 font-mono-siq text-[18px] tracking-[0.08em] text-[color:var(--siq-fg-deep)] outline-none placeholder:text-[13px] placeholder:tracking-[0.06em] placeholder:text-[color:var(--siq-fg-muted)]"
            />
            <div
              className="flex flex-1 items-center border-l border-[rgba(53,88,60,0.1)] px-4 text-[13px] leading-[1.4]"
              style={{ color: zipStatusColor }}
            >
              {zipStatusText}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-3 block text-[12px] uppercase tracking-[0.18em] text-[color:var(--siq-fg-muted)]">
            Monthly Electricity Bill
          </label>
          <div className="mb-4 font-sans-siq text-[52px] leading-none text-[color:var(--siq-fg-deep)]">
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
          <div className="mt-2 flex justify-between text-[12px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
            <span>$50 / mo</span>
            <span>$800 / mo</span>
          </div>
        </div>
      </div>
      <SavingsCalculatorTreeGarden />
    </div>
  );
}

/** Right column: orbs + placeholder or live results. */
function SavingsCalculatorResultsColumn({
  result,
  displayAnnual,
  pulseKey,
}: {
  result: SavingsResult | null;
  displayAnnual: number;
  pulseKey: number;
}) {
  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-[color:var(--siq-fg)] px-12 py-11">
      <SavingsCalculatorHeroOrbs />

      {!result ? (
        <div className="relative flex h-full flex-col items-start justify-center gap-4">
          <div className="text-[28px] text-white/20 [animation:siq-bounce-left_1.8s_ease-in-out_infinite]">←</div>
          <p className="max-w-[260px] text-[13px] leading-[1.75] text-white/40">
            Enter your ZIP code and drag the slider to see your personalized solar savings estimate.
          </p>
        </div>
      ) : (
        <SavingsCalculatorResultsBody result={result} displayAnnual={displayAnnual} pulseKey={pulseKey} />
      )}
    </div>
  );
}

export function SavingsCalculator() {
  const calc = useSavingsCalculator();

  return (
    <section className="siq-fade-in flex h-full flex-col border-b border-[rgba(53,88,60,0.1)] px-12 py-6">
      <div className="mb-4 flex items-baseline justify-between border-b border-[rgba(53,88,60,0.1)] pb-4">
        <h2 className="font-sans-siq text-[clamp(28px,3.5vw,48px)] font-normal leading-[1.05]">
          Potential <em className="not-italic italic text-[color:var(--siq-fg)]">Savings</em> Calculator
        </h2>
        <p className="max-w-[340px] text-right text-[14px] leading-[1.6] text-[color:var(--siq-fg-muted)]">
          Enter your ZIP and monthly bill — we match you to real solar performance data.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <SavingsCalculatorInputsColumn
          zip={calc.zip}
          setZip={calc.setZip}
          bill={calc.bill}
          setBill={calc.setBill}
          zipStatusText={calc.zipStatusText}
          zipStatusColor={calc.zipStatusColor}
        />
        <SavingsCalculatorResultsColumn
          result={calc.result}
          displayAnnual={calc.displayAnnual}
          pulseKey={calc.pulseKey}
        />
      </div>
    </section>
  );
}
