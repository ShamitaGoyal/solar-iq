import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import { Pause } from "lucide-react";
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
const Y_MIN = YEARS[0];
const Y_MAX = YEARS[YEARS.length - 1];
const YEAR_SPAN = Y_MAX - Y_MIN;

/** Full timeline scrub duration (linear “counter” over the year range). */
const RACE_TOTAL_MS = 11_000;

const fmt = (n: number) => (n >= 10000 ? `${Math.round(n / 1000)}k` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function buildSmoothChartData(
  yearFloat: number,
  cumByYear: Record<number, Record<Company, number>>,
): Array<{ year: number } & Record<Company, number>> {
  const clamped = Math.min(Math.max(yearFloat, Y_MIN), Y_MAX);
  const flo = Math.floor(clamped + 1e-9);
  const rows: Array<{ year: number } & Record<Company, number>> = [];

  for (const yr of YEARS) {
    if (yr > flo) break;
    rows.push({ year: yr, ...cumByYear[yr] });
  }

  const frac = clamped - flo;
  const nextY = YEARS.find((y) => y > flo);
  if (frac > 1e-5 && nextY !== undefined) {
    const t = (clamped - flo) / (nextY - flo);
    const row = { year: clamped } as { year: number } & Record<Company, number>;
    for (const c of COMPANIES) {
      row[c] = lerp(cumByYear[flo][c], cumByYear[nextY][c], t);
    }
    rows.push(row);
  }

  return rows;
}

function sumYearRaw(yr: number) {
  const r = RAW_BY_YEAR[yr];
  if (!r) return 0;
  return COMPANIES.reduce((s, c) => s + (r[c] || 0), 0);
}

function interpolateYearInstalls(yearFloat: number) {
  const clamped = Math.min(Math.max(yearFloat, Y_MIN), Y_MAX);
  const flo = Math.floor(clamped + 1e-9);
  const nextY = YEARS.find((y) => y > flo);
  const frac = clamped - flo;
  if (!nextY || frac < 1e-5) return sumYearRaw(flo);
  return Math.round(lerp(sumYearRaw(flo), sumYearRaw(nextY), (clamped - flo) / (nextY - flo)));
}

/** Fixed y-axis top from full timeline so the scale does not grow during the scrub. */
function fixedYAxisMax(cumByYear: Record<number, Record<Company, number>>) {
  const last = cumByYear[Y_MAX];
  let peak = 0;
  for (const c of COMPANIES) peak = Math.max(peak, last[c] ?? 0);
  const padded = Math.max(peak * 1.06, 1);
  const mag = 10 ** Math.floor(Math.log10(padded));
  const n = padded / mag;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * mag;
}

function lineRaceChartOption(
  chartData: Array<{ year: number } & Record<Company, number>>,
  yMax: number,
): echarts.EChartsCoreOption {
  const series: echarts.LineSeriesOption[] = COMPANIES.map((c) => ({
    name: LABELS[c],
    type: "line",
    smooth: false,
    showSymbol: false,
    lineStyle: { width: 2.5, color: COLORS[c], cap: "round", join: "round" },
    data: chartData.map((d) => [d.year, d[c]] as [number, number]),
    animation: false,
  }));

  return {
    animation: false,
    grid: { top: 20, right: 110, left: 36, bottom: 58 },
    xAxis: {
      type: "value",
      min: Y_MIN,
      max: Y_MAX,
      interval: 1,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#c8c6b0" } },
      axisTick: { show: true, lineStyle: { color: "#c8c6b0" } },
      axisLabel: {
        fontFamily: "DM Mono, monospace",
        fontSize: 9,
        color: "#9a9a90",
        formatter: (v: number) => String(Math.round(v)),
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: yMax,
      scale: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontFamily: "DM Mono, monospace",
        fontSize: 9,
        color: "#b0ae9e",
        formatter: (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)),
      },
      splitLine: { show: false },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#4a7a3a",
      borderColor: "#35583C",
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: "#FCFAEF", fontFamily: "DM Mono, monospace", fontSize: 11 },
      axisPointer: { type: "line", lineStyle: { color: "rgba(252,250,239,0.35)", width: 1 } },
      formatter: (params: unknown) => {
        const arr = params as Array<{ seriesName?: string; value?: [number, number] | number }>;
        if (!Array.isArray(arr) || arr.length === 0) return "";
        const x = arr[0].value;
        const year = Array.isArray(x) ? x[0] : x;
        const lines = arr
          .map((p) => {
            const raw = p.value;
            const y = Array.isArray(raw) ? raw[1] : typeof raw === "number" ? raw : 0;
            return `${p.seriesName ?? ""}: ${fmt(y)}`;
          })
          .join("<br/>");
        return `<span style="opacity:.6;font-size:9px;letter-spacing:.15em;text-transform:uppercase">${year}</span><br/>${lines}`;
      },
    },
    legend: {
      bottom: 4,
      icon: "rect",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 22,
      textStyle: { fontFamily: "DM Mono, monospace", fontSize: 10, color: "#4a4a40" },
      data: COMPANIES.map((c) => LABELS[c]),
    },
    series,
  };
}

export function LineRace() {
  const cumByYear = useMemo(() => {
    const run: Record<Company, number> = { solarcity: 0, sunrun: 0, titan: 0, freedom_forever: 0, sullivan: 0, records: 0 };
    const out: Record<number, Record<Company, number>> = {};
    for (const yr of YEARS) {
      for (const c of COMPANIES) run[c] += RAW_BY_YEAR[yr][c] || 0;
      out[yr] = { ...run };
    }
    return out;
  }, []);

  const chartYMax = useMemo(() => fixedYAxisMax(cumByYear), [cumByYear]);

  const [yearFloat, setYearFloat] = useState(Y_MIN);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstRef = useRef<echarts.ECharts | null>(null);

  const stop = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return;

    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const u = Math.min(elapsed / RACE_TOTAL_MS, 1);
      const yf = Y_MIN + u * YEAR_SPAN;
      setYearFloat(yf);
      if (u < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setYearFloat(Y_MAX);
        rafRef.current = null;
        setPlaying(false);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [playing]);

  const togglePlay = () => {
    if (playing) {
      stop();
    } else {
      setYearFloat(Y_MIN);
      setPlaying(true);
    }
  };

  const reset = () => {
    stop();
    setYearFloat(Y_MIN);
  };

  const chartData = useMemo(() => buildSmoothChartData(yearFloat, cumByYear), [yearFloat, cumByYear]);

  const head = chartData[chartData.length - 1];
  const cumTotal = head ? COMPANIES.reduce((s, c) => s + (head[c] ?? 0), 0) : 0;
  const leader = head
    ? COMPANIES.reduce((a, b) => ((head[a] ?? 0) >= (head[b] ?? 0) ? a : b))
    : COMPANIES[0];
  const yearTotal = interpolateYearInstalls(yearFloat);

  const displayYear = Math.round(Math.min(Math.max(yearFloat, Y_MIN), Y_MAX));

  useLayoutEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const chart = echarts.init(el);
    chartInstRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartInstRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstRef.current;
    if (!chart) return;
    chart.setOption(lineRaceChartOption(chartData, chartYMax), { replaceMerge: ["series"] });
  }, [chartData, chartYMax]);

  return (
    <section className="flex h-full flex-col bg-[color:var(--siq-cream)] px-12 py-6">
      {/* Header — title + blurb centered; year top-right on md+ */}
      <div className="siq-fade-in relative mb-4 pb-4">
        <div className="mb-4 flex justify-center md:absolute md:right-0 md:top-auto md:bottom-2 md:mb-0 md:justify-end">
          <div className="inline-flex flex-col items-center rounded-2xl border border-[color-mix(in_srgb,#487A3B_28%,transparent)] bg-[color-mix(in_srgb,#487A3B_34%,white)] px-5 py-3 text-center shadow-[0_2px_12px_rgba(72,122,59,0.12)]">
            <div className="font-sans-siq text-[52px] leading-none text-[color:var(--siq-fg)]">{displayYear}</div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--siq-fg-muted)]">Current Year</div>
          </div>
        </div>
        <div className="mx-auto max-w-[640px] px-3 text-center md:px-4">
          <h2 className="font-sans-siq text-[clamp(26px,3vw,45px)] leading-[1.05] tracking-[-0.015em] text-[color:var(--siq-fg-deep)]">
            Number of Orphaned
            <br />
            <em className="italic text-[color:var(--siq-fg)]">Units by Company</em>
          </h2>
          <p className="mt-3 text-[15px] leading-[1.65] text-[color:var(--siq-fg-muted)]">
            All solar installers, with the exception of Sunrun, have gone out of business — leaving a gap in the market for solar panel maintenance.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="siq-fade-in mb-3 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 border border-[color:var(--siq-fg)] bg-[color:var(--siq-fg)] px-[18px] py-2 font-mono-siq text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-cream)] transition hover:bg-[color:var(--siq-fg-deep)]"
        >
          {playing ? (
            <Pause className="size-[15px] shrink-0" strokeWidth={2.25} aria-hidden />
          ) : (
            <span aria-hidden>▶</span>
          )}
          <span>{playing ? "Pause" : "Play"}</span>
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 border border-[var(--siq-border)] bg-transparent px-[18px] py-2 font-mono-siq text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)] transition hover:border-[color:var(--siq-fg)] hover:text-[color:var(--siq-fg)]"
        >
          ↺ Reset
        </button>
      </div>

      {/* Chart — Apache ECharts (same init/setOption pattern as the official getting-started guide) */}
      <div
        className="siq-fade-in mb-10 min-h-0 flex-1 w-full"
        style={{ height: "min(300px, calc(100vh - 380px))" }}
      >
        <div ref={chartRef} className="h-full w-full min-h-[240px]" />
      </div>

      {/* Footer — centered with padding so it fits comfortably in the viewport */}
      <div className="mt-auto flex flex-wrap justify-center gap-x-6 gap-y-5 border-t border-[var(--siq-border)] px-4 py-6 sm:gap-x-10 sm:px-8 md:gap-x-14 md:py-8">
        <Stat label="Year Installs" value={yearTotal.toLocaleString()} />
        <Stat label="Cumulative Total" value={Math.round(cumTotal).toLocaleString()} />
        <Stat label="Current Leader" value={LABELS[leader]} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[min(100%,160px)] max-w-[220px] flex-1 basis-[140px] text-center sm:basis-auto sm:px-4">
      <div className="mb-1.5 text-[12px] uppercase tracking-[0.2em] text-[#b0ae9e]">{label}</div>
      <div className="text-[17px] font-medium leading-snug tracking-[0.02em] text-[color:var(--siq-fg-deep)]">{value}</div>
    </div>
  );
}
