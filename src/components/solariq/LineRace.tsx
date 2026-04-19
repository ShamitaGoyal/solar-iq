import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TIMELINE_BY_YEAR } from "@/data/timelineData";

const RAW_BY_YEAR = TIMELINE_BY_YEAR;

const COMPANIES = ["solarcity", "sunrun", "titan", "freedom_forever", "sullivan", "records"] as const;
type Company = (typeof COMPANIES)[number];
const LABELS: Record<Company, string> = {
  solarcity: "Tesla",
  sunrun: "Sunrun",
  titan: "Titan",
  freedom_forever: "Freedom Forever",
  sullivan: "Sullivan",
  records: "Unknown Source",
};
const COLORS: Record<Company, string> = {
  titan: "#35583C",
  sunrun: "#7aaa6a",
  freedom_forever: "#c17f3a",
  sullivan: "#6a8fbf",
  solarcity: "#b05a5a",
  records: "#9b7dc8",
};

const YEARS = Object.keys(RAW_BY_YEAR).map(Number).sort((a, b) => a - b);
const UPDATE_INTERVAL = 933;

const fmt = (n: number) => (n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export function LineRace() {
  // Pre-compute cumulative totals
  const cumByYear = useMemo(() => {
    const run: Record<Company, number> = { solarcity: 0, sunrun: 0, titan: 0, freedom_forever: 0, sullivan: 0, records: 0 };
    const out: Record<number, Record<Company, number>> = {};
    for (const yr of YEARS) {
      for (const c of COMPANIES) run[c] += RAW_BY_YEAR[yr][c] || 0;
      out[yr] = { ...run };
    }
    return out;
  }, []);

  const [yearIdx, setYearIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setYearIdx((i) => {
        if (i >= YEARS.length - 1) {
          stop();
          return i;
        }
        return i + 1;
      });
    }, UPDATE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const togglePlay = () => {
    if (playing) {
      stop();
    } else {
      if (yearIdx >= YEARS.length - 1) setYearIdx(0);
      setPlaying(true);
    }
  };

  const reset = () => {
    stop();
    setYearIdx(0);
  };

  // Build data slice up to current year
  const chartData = useMemo(() => {
    return YEARS.slice(0, yearIdx + 1).map((yr) => {
      const cum = cumByYear[yr];
      return { year: yr, ...cum };
    });
  }, [yearIdx, cumByYear]);

  const yr = YEARS[yearIdx];
  const cum = cumByYear[yr];
  const raw = RAW_BY_YEAR[yr];
  const yearTotal = COMPANIES.reduce((s, c) => s + (raw[c] || 0), 0);
  const cumTotal = COMPANIES.reduce((s, c) => s + (cum[c] || 0), 0);
  const leader = COMPANIES.reduce((a, b) => ((cum[a] || 0) >= (cum[b] || 0) ? a : b));
  const progress = (yearIdx / (YEARS.length - 1)) * 100;

  return (
    <section className="flex h-full flex-col border-t border-[var(--siq-border-strong)] bg-[color:var(--siq-cream)] px-12 py-6">
      {/* Header */}
      <div className="siq-fade-in mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--siq-border)] pb-4">
        <div>
          <h2 className="font-serif-siq text-[clamp(26px,3vw,38px)] leading-[1.05] tracking-[-0.015em] text-[color:var(--siq-fg-deep)]">
            Number of Orphaned
            <br />
            <em className="italic text-[color:var(--siq-fg)]">Units by Company</em>
          </h2>
          <p className="mt-3 max-w-[520px] text-[13px] leading-[1.6] text-[color:var(--siq-fg-muted)]">
            All solar installers, with the exception of Sunrun, have gone out of business — leaving a gap in the market for solar panel maintenance.
          </p>
        </div>
        <div className="text-right">
          <div className="font-serif-siq text-[52px] leading-none text-[color:var(--siq-fg)]">{yr}</div>
          <div className="mt-1 text-[13px] uppercase tracking-[0.22em] text-[color:var(--siq-fg-muted)]">Current Year</div>
        </div>
      </div>

      {/* Controls */}
      <div className="siq-fade-in mb-3 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 border border-[color:var(--siq-fg)] bg-[color:var(--siq-fg)] px-[18px] py-2 font-mono-siq text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-cream)] transition hover:bg-[color:var(--siq-fg-deep)]"
        >
          <span>{playing ? "⏸" : "▶"}</span>
          <span>{playing ? "Pause" : "Play"}</span>
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 border border-[var(--siq-border)] bg-transparent px-[18px] py-2 font-mono-siq text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)] transition hover:border-[color:var(--siq-fg)] hover:text-[color:var(--siq-fg)]"
        >
          ↺ Reset
        </button>
      </div>

      {/* Progress bar */}
      <div className="siq-fade-in mb-1 h-[2px] overflow-hidden bg-[#d4e3d6]">
        <div
          className="h-full bg-[color:var(--siq-fg)] transition-[width] duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mb-4 flex justify-between text-[13px] tracking-[0.14em] text-[#b0ae9e]">
        <span>2010</span>
        <span>2013</span>
        <span>2016</span>
        <span>2019</span>
        <span>2022</span>
        <span>2026</span>
      </div>

      {/* Chart */}
      <div className="siq-fade-in min-h-0 flex-1 w-full" style={{ height: "min(300px, calc(100vh - 380px))" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 110, left: 30, bottom: 30 }}>
            <CartesianGrid stroke="#e8e6d8" vertical={false} />
            <XAxis
              dataKey="year"
              type="number"
              domain={[YEARS[0], YEARS[YEARS.length - 1]]}
              ticks={YEARS}
              tick={{ fontFamily: "DM Mono, monospace", fontSize: 9, fill: "#9a9a90" }}
              stroke="#c8c6b0"
            />
            <YAxis
              tick={{ fontFamily: "DM Mono, monospace", fontSize: 9, fill: "#b0ae9e" }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#4a7a3a",
                border: "1px solid #35583C",
                color: "#FCFAEF",
                fontFamily: "DM Mono, monospace",
                fontSize: 11,
                padding: "10px 14px",
              }}
              labelStyle={{ color: "#FCFAEF", opacity: 0.6, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}
              itemStyle={{ color: "#FCFAEF" }}
              formatter={(value: number, name: string) => [fmt(value), name]}
            />
            <Legend
              iconType="rect"
              wrapperStyle={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#4a4a40", paddingTop: 8 }}
            />
            {COMPANIES.map((c) => (
              <Line
                key={c}
                type="monotone"
                dataKey={c}
                name={LABELS[c]}
                stroke={COLORS[c]}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-9 border-t border-[var(--siq-border)] pt-3 text-[13px] uppercase tracking-[0.15em] text-[color:var(--siq-fg-muted)]">
        <Stat label="Year Installs" value={yearTotal.toLocaleString()} />
        <Stat label="Cumulative Total" value={cumTotal.toLocaleString()} />
        <Stat label="Current Leader" value={LABELS[leader]} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-[3px] text-[13px] tracking-[0.2em] text-[#b0ae9e]">{label}</div>
      <div className="text-[13px] font-medium tracking-[0.03em] text-[color:var(--siq-fg-deep)]">{value}</div>
    </div>
  );
}
