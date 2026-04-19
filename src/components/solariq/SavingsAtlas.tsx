import { useEffect, useMemo, useRef, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { STATE_SAVINGS_DATA } from "@/data/stateSavings";

// FIPS (numeric id from us-atlas) → 2-letter abbreviation
const FIPS_TO_AB: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
  "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
  "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
  "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
  "55": "WI", "56": "WY",
};

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", DC: "District of Columbia", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const fmt$ = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${n.toLocaleString()}`;

// 4-stop ramp interpolation for choropleth
function rampColor(t: number) {
  const stops: Array<[number, number, number]> = [
    [232, 244, 232], // light cream-green
    [159, 196, 159], // soft mid
    [74, 122, 58], // green-mid
    [53, 88, 60], // deep green
  ];
  const seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const lt = t * (stops.length - 1) - seg;
  const a = stops[seg];
  const b = stops[seg + 1];
  const r = Math.round(a[0] + (b[0] - a[0]) * lt);
  const g = Math.round(a[1] + (b[1] - a[1]) * lt);
  const bl = Math.round(a[2] + (b[2] - a[2]) * lt);
  return `rgb(${r},${g},${bl})`;
}

// Confidence desaturation (rough HSL approximation in RGB space)
function applyConfidence(rgb: string, conf: string) {
  if (conf === "HIGH") return rgb;
  const m = rgb.match(/\d+/g);
  if (!m) return rgb;
  let [r, g, b] = m.map(Number);
  const factor = conf === "MEDIUM" ? 0.75 : 0.55;
  // Mix toward gray
  const gray = 0.3 * r + 0.59 * g + 0.11 * b;
  r = Math.round(r * factor + gray * (1 - factor));
  g = Math.round(g * factor + gray * (1 - factor));
  b = Math.round(b * factor + gray * (1 - factor));
  return `rgb(${r},${g},${bl(b)})`;
}
function bl(n: number) {
  return n;
}

type StateFeature = Feature<Geometry, { id: string }>;

export function SavingsAtlas() {
  const [hover, setHover] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; ab: string } | null>(null);
  const [statesGeo, setStatesGeo] = useState<StateFeature[] | null>(null);
  const [meshPath, setMeshPath] = useState<string>("");
  const wrapRef = useRef<HTMLDivElement>(null);

  // Stats
  const { total, min, max, ranked } = useMemo(() => {
    const entries = Object.entries(STATE_SAVINGS_DATA).filter(([s]) => STATE_NAMES[s]);
    const pcs = entries.map(([, v]) => v.pc).filter((n) => n > 0);
    const lo = Math.min(...pcs);
    const hi = Math.max(...pcs);
    const tot = entries.reduce((s, [, v]) => s + v.ts, 0);
    const ranks = [...entries].sort((a, b) => b[1].pc - a[1].pc).slice(0, 10);
    return { total: tot, min: lo, max: hi, ranked: ranks };
  }, []);

  // Load us-atlas topojson
  useEffect(() => {
    let cancelled = false;
    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
      .then((r) => r.json())
      .then((us: any) => {
        if (cancelled) return;
        const fc = feature(us, us.objects.states) as unknown as FeatureCollection<Geometry, { id: string }>;
        const m = mesh(us, us.objects.states, (a: any, b: any) => a !== b);
        const projection = geoAlbersUsa().scale(1280).translate([480, 290]);
        const path = geoPath(projection);
        setStatesGeo(fc.features as StateFeature[]);
        setMeshPath(path(m as any) || "");
      })
      .catch((e) => console.error("Atlas load failed", e));
    return () => {
      cancelled = true;
    };
  }, []);

  const projection = useMemo(() => geoAlbersUsa().scale(1280).translate([480, 290]), []);
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const hoveredData = hover ? STATE_SAVINGS_DATA[hover] : null;

  function getFill(ab: string) {
    const v = STATE_SAVINGS_DATA[ab];
    if (!v || v.pc <= 0) return "#e0ddd0";
    const t = (v.pc - min) / (max - min);
    return applyConfidence(rampColor(Math.max(0, Math.min(1, t))), v.c);
  }

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
        {/* SVG Map */}
        <div ref={wrapRef} className="relative">
          <svg viewBox="0 0 960 580" className="h-auto w-full">
            <defs>
              <pattern
                id="hatch"
                patternUnits="userSpaceOnUse"
                width={5}
                height={5}
                patternTransform="rotate(45)"
              >
                <line x1={0} y1={0} x2={0} y2={5} stroke="rgba(53,88,60,0.18)" strokeWidth={1.6} />
              </pattern>
            </defs>

            {!statesGeo && (
              <text x={480} y={290} textAnchor="middle" className="fill-[color:var(--siq-fg-muted)] text-[14px]">
                Loading map…
              </text>
            )}

            {statesGeo && (
              <g>
                {statesGeo.map((f) => {
                  const ab = FIPS_TO_AB[String(f.id).padStart(2, "0")];
                  if (!ab) return null;
                  const d = pathGen(f as any) || "";
                  const v = STATE_SAVINGS_DATA[ab];
                  const isHover = hover === ab;
                  return (
                    <path
                      key={ab}
                      d={d}
                      fill={getFill(ab)}
                      stroke={isHover ? "#1c1c18" : "rgba(252,250,239,0.7)"}
                      strokeWidth={isHover ? 1.4 : 0.6}
                      style={{
                        cursor: "pointer",
                        transition: "stroke 120ms ease",
                        filter: isHover ? "brightness(1.08)" : undefined,
                      }}
                      onMouseEnter={() => setHover(ab)}
                      onMouseMove={(e) => {
                        const rect = wrapRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, ab });
                      }}
                      onMouseLeave={() => {
                        setHover(null);
                        setTooltip(null);
                      }}
                    />
                  );
                })}
                {/* LOW confidence hatch overlay */}
                {statesGeo.map((f) => {
                  const ab = FIPS_TO_AB[String(f.id).padStart(2, "0")];
                  if (!ab) return null;
                  const v = STATE_SAVINGS_DATA[ab];
                  if (!v || v.c !== "LOW") return null;
                  const d = pathGen(f as any) || "";
                  return <path key={`h-${ab}`} d={d} fill="url(#hatch)" pointerEvents="none" />;
                })}
                {/* Mesh */}
                <path d={meshPath} fill="none" stroke="rgba(252,250,239,0.65)" strokeWidth={0.6} pointerEvents="none" />
              </g>
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && hoveredData && (
            <div
              className="pointer-events-none absolute z-10 min-w-[180px] border border-[var(--siq-fg)] bg-[color:var(--siq-cream)] px-3 py-2 shadow-lg"
              style={{
                left: Math.min(tooltip.x + 14, (wrapRef.current?.clientWidth ?? 800) - 200),
                top: tooltip.y + 14,
              }}
            >
              <div className="mb-1 font-serif-siq text-[16px] leading-none text-[color:var(--siq-fg)]">
                {STATE_NAMES[tooltip.ab]} · {tooltip.ab}
              </div>
              <div className="space-y-[2px] text-[10px] text-[color:var(--siq-fg-deep)]">
                <div>
                  Per capita: <span className="font-medium">${hoveredData.pc.toLocaleString()}</span>
                </div>
                <div>
                  Total: <span className="font-medium">{fmt$(hoveredData.ts)}</span>
                </div>
                <div>Pop: {hoveredData.p.toLocaleString()}</div>
                <div>ZIPs: {hoveredData.z}</div>
                <div className="pt-1 text-[8px] uppercase tracking-[0.13em] text-[color:var(--siq-fg-muted)]">
                  {hoveredData.c} confidence
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[8px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">
              Per-capita savings
            </span>
            <span className="text-[8px] text-[color:var(--siq-fg-muted)]">${min.toLocaleString()}</span>
            <div
              className="h-[6px] w-[160px] border border-[rgba(53,88,60,0.18)]"
              style={{ background: "linear-gradient(to right, #e8f4e8, #9fc49f, #4a7a3a, #35583C)" }}
            />
            <span className="text-[8px] text-[color:var(--siq-fg-muted)]">${max.toLocaleString()}</span>
            <span className="ml-3 inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.13em] text-[color:var(--siq-fg-muted)]">
              <span
                className="inline-block h-[10px] w-[14px] border border-[rgba(53,88,60,0.18)]"
                style={{ background: "url(#hatch), #e8f4e8" }}
              />
              hatch = LOW confidence
            </span>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="border-l border-[var(--siq-border)] pl-6">
          <div className="border-b border-[var(--siq-border)] pb-4">
            <div className="text-[8px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
              {hover ? "Selected State" : "Hover Map"}
            </div>
            {hoveredData ? (
              <div className="mt-2">
                <div className="font-serif-siq text-[28px] leading-none text-[color:var(--siq-fg)]">
                  {STATE_NAMES[hover!]}
                </div>
                <div className="mt-1 text-[9px] tracking-[0.12em] text-[color:var(--siq-fg-muted)]">{hover}</div>
                <div className="mt-3 space-y-1.5 text-[10px]">
                  <Row label="Per Capita" value={`$${hoveredData.pc.toLocaleString()}`} highlight />
                  <Row label="Total Savings" value={fmt$(hoveredData.ts)} highlight />
                  <Row label="Population" value={hoveredData.p.toLocaleString()} />
                  <Row label="ZIPs" value={String(hoveredData.z)} />
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[10px] italic text-[color:var(--siq-fg-muted)]">
                Hover any state to see its breakdown.
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
                      <span className="text-[9px] tracking-[0.04em] text-[color:var(--siq-fg)]">
                        {STATE_NAMES[state] ?? state}
                      </span>
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
