import { useMemo, useState } from "react";
import { STATE_SAVINGS_DATA } from "@/data/stateSavings";

// US tile-grid layout (row, col) — classic state-grid choropleth
const GRID: Record<string, [number, number]> = {
  AK: [0, 0], ME: [0, 10],
  VT: [1, 9], NH: [1, 10],
  WA: [2, 1], ID: [2, 2], MT: [2, 3], ND: [2, 4], MN: [2, 5], IL: [2, 6], WI: [2, 7], MI: [2, 8], NY: [2, 9], MA: [2, 10], RI: [2, 11],
  OR: [3, 1], NV: [3, 2], WY: [3, 3], SD: [3, 4], IA: [3, 5], IN: [3, 6], OH: [3, 7], PA: [3, 8], NJ: [3, 9], CT: [3, 10],
  CA: [4, 1], UT: [4, 2], CO: [4, 3], NE: [4, 4], MO: [4, 5], KY: [4, 6], WV: [4, 7], VA: [4, 8], MD: [4, 9], DE: [4, 10],
  AZ: [5, 2], NM: [5, 3], KS: [5, 4], AR: [5, 5], TN: [5, 6], NC: [5, 7], SC: [5, 8], DC: [5, 9],
  HI: [6, 0], OK: [6, 4], LA: [6, 5], MS: [6, 6], AL: [6, 7], GA: [6, 8],
  TX: [7, 4], FL: [7, 8],
};

const fmt$ = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

// 3-stop ramp (cream → mid → deep green) using oklch-ish hex
function rampColor(t: number) {
  // t in [0,1]
  const stops = [
    [232, 244, 232], // light
    [74, 122, 58], // green-mid
    [53, 88, 60], // green
  ];
  const i = t < 0.5 ? 0 : 1;
  const lt = t < 0.5 ? t * 2 : (t - 0.5) * 2;
  const a = stops[i];
  const b = stops[i + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * lt);
  const g = Math.round(a[1] + (b[1] - a[1]) * lt);
  const bl = Math.round(a[2] + (b[2] - a[2]) * lt);
  return `rgb(${r},${g},${bl})`;
}

export function SavingsAtlas() {
  const [hover, setHover] = useState<string | null>(null);

  const { rows, total, min, max, ranked } = useMemo(() => {
    const entries = Object.entries(STATE_SAVINGS_DATA).filter(([s]) => GRID[s]);
    const pcs = entries.map(([, v]) => v.pc).filter((n) => n > 0);
    const lo = Math.min(...pcs);
    const hi = Math.max(...pcs);
    const tot = entries.reduce((s, [, v]) => s + v.ts, 0);
    const ranks = [...entries].sort((a, b) => b[1].pc - a[1].pc).slice(0, 10);
    return { rows: entries, total: tot, min: lo, max: hi, ranked: ranks };
  }, []);

  const hovered = hover ? STATE_SAVINGS_DATA[hover] : null;
  const maxRows = 8;
  const maxCols = 12;

  return (
    <section className="border-t border-[var(--siq-border-strong)] bg-[color:var(--siq-cream)] px-13 py-20">
      {/* Header */}
      <div className="siq-fade-in mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[var(--siq-border)] pb-6">
        <div>
          <div className="mb-3 inline-flex items-center gap-[7px] rounded-full border border-[rgba(53,88,60,0.22)] px-4 py-1.5">
            <div className="h-[5px] w-[5px] rounded-full bg-[color:var(--siq-fg)]" />
            <span className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
              National Solar Potential
            </span>
          </div>
          <h2 className="font-serif-siq text-[56px] font-normal leading-[0.95] tracking-[-0.02em] text-[color:var(--siq-fg)]">
            Solar <em className="italic text-[color:var(--siq-fg-deep)]">Savings</em> Atlas
          </h2>
          <p className="mt-3 max-w-[520px] text-[12px] leading-[1.7] text-[color:var(--siq-fg-muted)]">
            Per-capita annual savings if every household went solar. Hover any state for breakdown.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[8px] uppercase tracking-[0.16em] text-[color:var(--siq-fg-muted)]">
            Total National Potential · Annual
          </div>
          <div className="font-serif-siq text-[44px] leading-none text-[color:var(--siq-fg)]">{fmt$(total)}</div>
          <div className="mt-1 text-[8px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
            across all households · 50 states
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="siq-fade-in grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
        {/* Tile grid map */}
        <div className="relative">
          <div
            className="grid gap-[6px]"
            style={{
              gridTemplateColumns: `repeat(${maxCols}, minmax(0,1fr))`,
              gridTemplateRows: `repeat(${maxRows}, 56px)`,
            }}
          >
            {rows.map(([state, v]) => {
              const [r, c] = GRID[state];
              const t = v.pc > 0 ? (v.pc - min) / (max - min) : 0;
              const fill = v.pc > 0 ? rampColor(t) : "#e8e6d8";
              const isHover = hover === state;
              return (
                <button
                  key={state}
                  onMouseEnter={() => setHover(state)}
                  onMouseLeave={() => setHover(null)}
                  className="relative flex flex-col items-center justify-center border transition-all"
                  style={{
                    gridRow: r + 1,
                    gridColumn: c + 1,
                    background: fill,
                    borderColor: isHover ? "var(--siq-fg-deep)" : "rgba(53,88,60,0.18)",
                    boxShadow: isHover ? "0 4px 14px rgba(53,88,60,0.25)" : "none",
                    transform: isHover ? "translateY(-2px)" : "none",
                    color: t > 0.55 ? "#FCFAEF" : "#1c1c18",
                  }}
                >
                  <span className="text-[10px] font-medium tracking-[0.05em]">{state}</span>
                  <span className="text-[8px] opacity-80">${(v.pc / 1000).toFixed(1)}k</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center gap-3">
            <span className="text-[8px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
              Per-capita savings
            </span>
            <span className="text-[8px] text-[color:var(--siq-fg-muted)]">${min.toLocaleString()}</span>
            <div
              className="h-[6px] w-[160px] border border-[rgba(53,88,60,0.18)]"
              style={{ background: "linear-gradient(to right, #e8f4e8, #4a7a3a, #35583C)" }}
            />
            <span className="text-[8px] text-[color:var(--siq-fg-muted)]">${max.toLocaleString()}</span>
          </div>
        </div>

        {/* Sidebar — hover detail + rankings */}
        <aside className="border-l border-[var(--siq-border)] pl-6">
          <div className="border-b border-[var(--siq-border)] pb-4">
            <div className="text-[8px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
              {hover ? "Selected State" : "Hover Map"}
            </div>
            {hovered ? (
              <div className="mt-2">
                <div className="font-serif-siq text-[28px] leading-none text-[color:var(--siq-fg)]">{hover}</div>
                <div className="mt-3 space-y-1.5 text-[10px]">
                  <Row label="Per Capita" value={`$${hovered.pc.toLocaleString()}`} highlight />
                  <Row label="Total Savings" value={fmt$(hovered.ts)} highlight />
                  <Row label="Population" value={hovered.p.toLocaleString()} />
                  <Row label="ZIPs" value={String(hovered.z)} />
                  <div className="pt-2">
                    <span
                      className="inline-block border px-2 py-[2px] text-[7px] tracking-[0.13em]"
                      style={{
                        background: hovered.c === "HIGH" ? "var(--siq-fg)" : "transparent",
                        color: hovered.c === "HIGH" ? "var(--siq-cream)" : "var(--siq-fg-muted)",
                        borderColor: hovered.c === "HIGH" ? "var(--siq-fg)" : "var(--siq-fg-muted)",
                      }}
                    >
                      {hovered.c} CONFIDENCE
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[10px] italic text-[color:var(--siq-fg-muted)]">
                Hover any tile to see breakdown.
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-3 text-[8px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
              Top 10 · Per Capita
            </div>
            <div className="space-y-2">
              {ranked.map(([state, v], i) => {
                const w = (v.pc / max) * 100;
                return (
                  <div
                    key={state}
                    className="grid cursor-default grid-cols-[18px_1fr] gap-1.5 border-b border-[var(--siq-border)] pb-1.5"
                    onMouseEnter={() => setHover(state)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="pt-[1px] text-right text-[8px] text-[color:var(--siq-fg-muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-[2px]">
                      <span className="text-[9px] tracking-[0.04em] text-[color:var(--siq-fg)]">{state}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-[2px] bg-[color:var(--siq-fg)] transition-all duration-500"
                          style={{ width: `${w}%` }}
                        />
                        <span className="whitespace-nowrap text-[8px] text-[color:var(--siq-fg-muted)]">
                          ${v.pc.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[7px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">{label}</span>
      <span style={{ color: highlight ? "var(--siq-fg)" : "var(--siq-fg-deep)" }}>{value}</span>
    </div>
  );
}
