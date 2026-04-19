import { useEffect, useMemo, useRef, useState } from "react";
import { geoAlbersUsa, geoPath, geoMercator } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { STATE_SAVINGS_DATA } from "@/data/stateSavings";
import { ZIP_DATA } from "@/data/zipData";
import { ZIP_CENTROIDS } from "@/data/zipCentroids";

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

function rampColor(t: number) {
  const stops: Array<[number, number, number]> = [
    [240, 237, 222],  // near-cream
    [172, 213, 148],  // light sage
    [60, 130, 50],    // vivid mid-green
    [14, 48, 22],     // near-black forest
  ];
  const seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const lt = t * (stops.length - 1) - seg;
  const a = stops[seg];
  const b = stops[seg + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * lt)},${Math.round(a[1] + (b[1] - a[1]) * lt)},${Math.round(a[2] + (b[2] - a[2]) * lt)})`;
}

function applyConfidence(rgb: string, conf: string) {
  if (conf === "HIGH") return rgb;
  const m = rgb.match(/\d+/g);
  if (!m) return rgb;
  let [r, g, b] = m.map(Number);
  const factor = conf === "MEDIUM" ? 0.75 : 0.55;
  const gray = 0.3 * r + 0.59 * g + 0.11 * b;
  return `rgb(${Math.round(r * factor + gray * (1 - factor))},${Math.round(g * factor + gray * (1 - factor))},${Math.round(b * factor + gray * (1 - factor))})`;
}

type StateFeature = Feature<Geometry, { id: string }>;

const SVG_W = 960;
const SVG_H = 580;

export function SavingsAtlas() {
  const [hover, setHover] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; ab: string } | null>(null);
  const [statesGeo, setStatesGeo] = useState<StateFeature[] | null>(null);
  const [meshPath, setMeshPath] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredZip, setHoveredZip] = useState<string | null>(null);
  const [zipTooltip, setZipTooltip] = useState<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { total, min, max, ranked } = useMemo(() => {
    const entries = Object.entries(STATE_SAVINGS_DATA).filter(([s]) => STATE_NAMES[s]);
    const pcs = entries.map(([, v]) => v.pc).filter((n) => n > 0);
    const lo = Math.min(...pcs);
    const hi = Math.max(...pcs);
    const tot = entries.reduce((s, [, v]) => s + v.ts, 0);
    const ranks = [...entries].sort((a, b) => b[1].pc - a[1].pc).slice(0, 10);
    return { total: tot, min: lo, max: hi, ranked: ranks };
  }, []);

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
    return () => { cancelled = true; };
  }, []);

  const projection = useMemo(() => geoAlbersUsa().scale(1280).translate([480, 290]), []);
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  // State drilldown data
  const stateZipEntries = useMemo(() => {
    if (!selectedState) return null;
    const entries = Object.entries(ZIP_DATA)
      .filter(([, d]) => d.state === selectedState)
      .map(([zip, d]) => {
        const centroid = ZIP_CENTROIDS[zip];
        const savings = Math.round(d.kwh * d.rate);
        return { zip, ...d, savings, centroid: centroid ?? null };
      })
      .filter((z) => z.centroid !== null)
      .sort((a, b) => b.savings - a.savings);
    return entries as Array<{ zip: string; city: string; state: string; rate: number; kwh: number; offset: number; kw: number; tilt: number; savings: number; centroid: [number, number] }>;
  }, [selectedState]);

  // Projection fitted to ZIP centroids — reliable bounds, not skewed by outlier polygons
  const stateProj = useMemo(() => {
    if (!stateZipEntries || stateZipEntries.length === 0) return null;
    const coords = stateZipEntries.map((z) => [z.centroid[1], z.centroid[0]] as [number, number]);
    return geoMercator().fitExtent(
      [[40, 30], [SVG_W - 40, SVG_H - 30]],
      { type: "MultiPoint", coordinates: coords } as any,
    );
  }, [stateZipEntries]);

  // Path generator for the state drilldown (uses stateProj)
  const statePathGen = useMemo(() => stateProj ? geoPath(stateProj) : null, [stateProj]);

  // The selected state's topojson feature (for drawing its outline)
  const selectedStateFeat = useMemo(() => {
    if (!selectedState || !statesGeo) return null;
    return statesGeo.find((f) => FIPS_TO_AB[String(f.id).padStart(2, "0")] === selectedState) ?? null;
  }, [selectedState, statesGeo]);

  // Color scale for state ZIP view
  const { zipMin, zipMax } = useMemo(() => {
    if (!stateZipEntries || stateZipEntries.length === 0) return { zipMin: 0, zipMax: 1 };
    const vals = stateZipEntries.map((z) => z.savings);
    return { zipMin: Math.min(...vals), zipMax: Math.max(...vals) };
  }, [stateZipEntries]);

  const hoveredZipData = hoveredZip && stateZipEntries
    ? stateZipEntries.find((z) => z.zip === hoveredZip) ?? null
    : null;

  function getFill(ab: string) {
    const v = STATE_SAVINGS_DATA[ab];
    if (!v || v.pc <= 0) return "#e0ddd0";
    const t = (v.pc - min) / (max - min);
    return applyConfidence(rampColor(Math.max(0, Math.min(1, t))), v.c);
  }

  function getZipColor(savings: number) {
    const t = zipMax === zipMin ? 0.5 : (savings - zipMin) / (zipMax - zipMin);
    return rampColor(Math.max(0, Math.min(1, t)));
  }

  useEffect(() => {
    setHoveredZip(null);
    setZipTooltip(null);
  }, [selectedState]);

  const hoveredData = hover ? STATE_SAVINGS_DATA[hover] : null;

  return (
    <section className="flex h-full flex-col border-t border-[var(--siq-border-strong)] bg-[color:var(--siq-cream)] px-10 py-5">
      {/* Header */}
      <div className="siq-fade-in mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--siq-border)] pb-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-[7px] rounded-full border border-[rgba(53,88,60,0.22)] px-4 py-1.5">
            <div className="h-[5px] w-[5px] rounded-full bg-[color:var(--siq-fg)]" />
            <span className="text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-deep)]">
              National Solar Potential
            </span>
          </div>
          {/* Breadcrumb */}
          <div className="mb-2 flex items-center gap-2 text-[13px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">
            <button
              className="hover:text-[color:var(--siq-fg)] transition-colors"
              onClick={() => setSelectedState(null)}
            >
              United States
            </button>
            {selectedState && (
              <>
                <span>›</span>
                <span className="text-[color:var(--siq-fg)]">{STATE_NAMES[selectedState] ?? selectedState}</span>
              </>
            )}
          </div>
          <h2 className="font-serif-siq text-[clamp(32px,3.5vw,48px)] font-normal leading-[0.95] tracking-[-0.02em] text-[color:var(--siq-fg)]">
            Solar <em className="italic text-[color:var(--siq-fg-deep)]">Savings</em> Atlas
          </h2>
          {!selectedState && (
            <p className="mt-3 max-w-[520px] text-[14px] leading-[1.7] text-[color:var(--siq-fg-muted)]">
              Per-capita annual savings if every household went solar. Click any state to drill into ZIP codes.
            </p>
          )}
          {selectedState && (
            <p className="mt-3 max-w-[520px] text-[14px] leading-[1.7] text-[color:var(--siq-fg-muted)]">
              Annual savings potential by ZIP code in {STATE_NAMES[selectedState]}. Each dot is a ZIP code — darker means higher savings.
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          {selectedState && (
            <button
              onClick={() => setSelectedState(null)}
              className="flex items-center gap-2 border border-[color:var(--siq-fg)] px-4 py-2 font-mono-siq text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-fg)] transition hover:bg-[color:var(--siq-fg)] hover:text-[color:var(--siq-cream)]"
            >
              ← National View
            </button>
          )}
          <div className="text-right">
            <div className="text-[13px] uppercase tracking-[0.16em] text-[color:var(--siq-fg-muted)]">
              Total Yearly National Potential
            </div>
            <div className="font-serif-siq text-[42px] leading-none text-[color:var(--siq-fg)]">{fmt$(total)}</div>
          </div>
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="siq-fade-in grid grid-cols-1 gap-8 md:grid-cols-[1fr_340px]">

        {/* ── NATIONAL VIEW ── */}
        {!selectedState && (
          <div ref={wrapRef} className="relative">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: "clamp(300px, calc(100vh - 280px), 530px)" }}>
              <defs>
                <pattern id="hatch" patternUnits="userSpaceOnUse" width={5} height={5} patternTransform="rotate(45)">
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
                    const isHover = hover === ab;
                    return (
                      <path
                        key={ab}
                        d={d}
                        fill={getFill(ab)}
                        stroke={isHover ? "#1c1c18" : "rgba(252,250,239,0.7)"}
                        strokeWidth={isHover ? 1.4 : 0.6}
                        style={{ cursor: "pointer", transition: "stroke 120ms ease", filter: isHover ? "brightness(1.08)" : undefined }}
                        onMouseEnter={() => setHover(ab)}
                        onMouseMove={(e) => {
                          const rect = wrapRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, ab });
                        }}
                        onMouseLeave={() => { setHover(null); setTooltip(null); }}
                        onClick={() => setSelectedState(ab)}
                      />
                    );
                  })}
                  {statesGeo.map((f) => {
                    const ab = FIPS_TO_AB[String(f.id).padStart(2, "0")];
                    if (!ab) return null;
                    const v = STATE_SAVINGS_DATA[ab];
                    if (!v || v.c !== "LOW") return null;
                    const d = pathGen(f as any) || "";
                    return <path key={`h-${ab}`} d={d} fill="url(#hatch)" pointerEvents="none" />;
                  })}
                  <path d={meshPath} fill="none" stroke="rgba(252,250,239,0.65)" strokeWidth={0.6} pointerEvents="none" />
                </g>
              )}
            </svg>

            {tooltip && hoveredData && (
              <div
                className="pointer-events-none absolute z-10 min-w-[180px] border border-[var(--siq-fg)] bg-[color:var(--siq-cream)] px-3 py-2 shadow-lg"
                style={{
                  left: Math.min(tooltip.x + 14, (wrapRef.current?.clientWidth ?? 800) - 200),
                  top: tooltip.y + 14,
                }}
              >
                <div className="mb-1 font-serif-siq text-[20px] leading-none text-[color:var(--siq-fg)]">
                  {STATE_NAMES[tooltip.ab]} · {tooltip.ab}
                </div>
                <div className="space-y-[2px] text-[13px] text-[color:var(--siq-fg-deep)]">
                  <div>Per capita: <span className="font-medium">${hoveredData.pc.toLocaleString()}</span></div>
                  <div>Total: <span className="font-medium">{fmt$(hoveredData.ts)}</span></div>
                  <div>Pop: {hoveredData.p.toLocaleString()}</div>
                  <div>ZIPs: {hoveredData.z}</div>
                  <div className="pt-1 text-[13px] uppercase tracking-[0.13em] text-[color:var(--siq-fg-muted)]">{hoveredData.c} confidence</div>
                  <div className="pt-0.5 text-[13px] italic text-[color:var(--siq-fg-muted)]">Click to drill into ZIP codes →</div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">Per-capita savings</span>
              <span className="text-[13px] text-[color:var(--siq-fg-muted)]">${min.toLocaleString()}</span>
              <div className="h-[6px] w-[160px] border border-[rgba(53,88,60,0.18)]" style={{ background: "linear-gradient(to right, #f0edde, #acd594, #3c8232, #0e3016)" }} />
              <span className="text-[13px] text-[color:var(--siq-fg-muted)]">${max.toLocaleString()}</span>
              <span className="ml-3 inline-flex items-center gap-1.5 text-[13px] uppercase tracking-[0.13em] text-[color:var(--siq-fg-muted)]">
                <span className="inline-block h-[10px] w-[14px] border border-[rgba(53,88,60,0.18)]" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(53,88,60,0.18) 0, rgba(53,88,60,0.18) 1px, transparent 0, transparent 50%)", backgroundSize: "5px 5px", backgroundColor: "#e8f4e8" }} />
                hatch = LOW confidence
              </span>
            </div>
          </div>
        )}

        {/* ── STATE DRILLDOWN VIEW ── */}
        {selectedState && (
          <div className="relative" ref={wrapRef}>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="w-full border border-[rgba(53,88,60,0.1)]"
              style={{ maxHeight: "clamp(300px, calc(100vh - 280px), 530px)", background: "#f8f6ed" }}
            >
              {statePathGen && selectedStateFeat && (
                <path
                  d={statePathGen(selectedStateFeat as any) || ""}
                  fill="rgba(53,88,60,0.04)"
                  stroke="rgba(50,50,45,0.5)"
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              )}

              {stateZipEntries && stateProj && stateZipEntries.map((z) => {
                const [lat, lon] = z.centroid;
                const pt = stateProj([lon, lat]);
                if (!pt) return null;
                const [px, py] = pt;
                const isHov = hoveredZip === z.zip;
                return (
                  <circle
                    key={z.zip}
                    cx={px}
                    cy={py}
                    r={isHov ? 5 : 3.5}
                    fill={getZipColor(z.savings)}
                    fillOpacity={isHov ? 1 : 0.85}
                    stroke={isHov ? "#1c1c18" : "rgba(252,250,239,0.4)"}
                    strokeWidth={isHov ? 1.2 : 0.5}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredZip(z.zip)}
                    onMouseMove={(e) => {
                      const rect = wrapRef.current?.getBoundingClientRect();
                      if (!rect) return;
                      setZipTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    }}
                    onMouseLeave={() => { setHoveredZip(null); setZipTooltip(null); }}
                  />
                );
              })}
            </svg>

            {/* ZIP tooltip */}
            {zipTooltip && hoveredZipData && (
              <div
                className="pointer-events-none absolute z-10 min-w-[160px] border border-[var(--siq-fg)] bg-[color:var(--siq-cream)] px-3 py-2 shadow-lg"
                style={{
                  left: Math.min(zipTooltip.x + 14, (wrapRef.current?.clientWidth ?? 800) - 180),
                  top: zipTooltip.y + 14,
                }}
              >
                <div className="mb-1 font-serif-siq text-[19px] leading-none text-[color:var(--siq-fg)]">
                  {hoveredZipData.city} · {hoveredZipData.zip}
                </div>
                <div className="space-y-[2px] text-[13px] text-[color:var(--siq-fg-deep)]">
                  <div>Est. savings: <span className="font-medium">{fmt$(hoveredZipData.savings)}/yr</span></div>
                  <div>Bill offset: <span className="font-medium">{hoveredZipData.offset.toFixed(1)}%</span></div>
                  <div>Avg system: <span className="font-medium">{hoveredZipData.kw.toFixed(1)} kW</span></div>
                  <div>Rate: <span className="font-medium">${hoveredZipData.rate.toFixed(3)}/kWh</span></div>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">ZIP savings/yr</span>
              <span className="text-[13px] text-[color:var(--siq-fg-muted)]">{fmt$(zipMin)}</span>
              <div className="h-[6px] w-[140px] border border-[rgba(53,88,60,0.18)]" style={{ background: "linear-gradient(to right, #f0edde, #acd594, #3c8232, #0e3016)" }} />
              <span className="text-[13px] text-[color:var(--siq-fg-muted)]">{fmt$(zipMax)}</span>
              <span className="ml-2 text-[13px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">· {stateZipEntries?.length ?? 0} ZIP codes</span>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside className="border-l border-[var(--siq-border)] pl-6">
          {!selectedState ? (
            <>
              <div className="border-b border-[var(--siq-border)] pb-4">
                <div className="text-[13px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
                  {hover ? "Selected State" : "Hover Map"}
                </div>
                {hoveredData ? (
                  <div className="mt-2">
                    <div className="font-serif-siq text-[28px] leading-none text-[color:var(--siq-fg)]">{STATE_NAMES[hover!]}</div>
                    <div className="mt-1 text-[12px] tracking-[0.12em] text-[color:var(--siq-fg-muted)]">{hover}</div>
                    <div className="mt-3 space-y-1.5 text-[13px]">
                      <Row label="Per Capita" value={`$${hoveredData.pc.toLocaleString()}`} highlight />
                      <Row label="Total Savings" value={fmt$(hoveredData.ts)} highlight />
                      <Row label="Population" value={hoveredData.p.toLocaleString()} />
                      <Row label="ZIPs" value={String(hoveredData.z)} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-[13px] italic text-[color:var(--siq-fg-muted)]">
                    Hover any state to see its breakdown. Click to drill into ZIP codes.
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="mb-3 text-[13px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">Top 10 · Per Capita</div>
                <div className="space-y-2">
                  {ranked.map(([state, v], i) => {
                    const w = (v.pc / max) * 100;
                    return (
                      <div
                        key={state}
                        className="grid cursor-pointer grid-cols-[18px_1fr] gap-1.5 border-b border-[var(--siq-border)] pb-1.5 hover:bg-[rgba(53,88,60,0.04)]"
                        onMouseEnter={() => setHover(state)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => setSelectedState(state)}
                      >
                        <span className="pt-[1px] text-right text-[13px] text-[color:var(--siq-fg-muted)]">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex flex-col gap-[2px]">
                          <span className="text-[12px] tracking-[0.04em] text-[color:var(--siq-fg)]">{STATE_NAMES[state] ?? state}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-[2px] bg-[color:var(--siq-fg)] transition-all duration-500" style={{ width: `${w}%` }} />
                            <span className="whitespace-nowrap text-[13px] text-[color:var(--siq-fg-muted)]">${v.pc.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* State drilldown sidebar */
            <>
              <div className="border-b border-[var(--siq-border)] pb-4">
                <div className="text-[13px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">State Overview</div>
                <div className="mt-2">
                  <div className="font-serif-siq text-[28px] leading-none text-[color:var(--siq-fg)]">{STATE_NAMES[selectedState]}</div>
                  {(() => {
                    const v = STATE_SAVINGS_DATA[selectedState];
                    return v ? (
                      <div className="mt-3 space-y-1.5 text-[13px]">
                        <Row label="Per Capita" value={`$${v.pc.toLocaleString()}`} highlight />
                        <Row label="Total Savings" value={fmt$(v.ts)} highlight />
                        <Row label="Population" value={v.p.toLocaleString()} />
                        <Row label="ZIP Codes" value={`${stateZipEntries?.length ?? 0} mapped`} />
                        <Row label="Confidence" value={v.c} />
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-3 text-[13px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
                  Top ZIPs · Est. Savings/Yr
                </div>
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 380 }}>
                  {(stateZipEntries ?? []).slice(0, 15).map((z, i) => {
                    const w = zipMax === zipMin ? 50 : ((z.savings - zipMin) / (zipMax - zipMin)) * 100;
                    const isHov = hoveredZip === z.zip;
                    return (
                      <div
                        key={z.zip}
                        className="grid cursor-default grid-cols-[18px_1fr] gap-1.5 border-b border-[var(--siq-border)] pb-1.5 transition-colors"
                        style={{ background: isHov ? "rgba(53,88,60,0.06)" : undefined }}
                        onMouseEnter={() => setHoveredZip(z.zip)}
                        onMouseLeave={() => setHoveredZip(null)}
                      >
                        <span className="pt-[1px] text-right text-[13px] text-[color:var(--siq-fg-muted)]">{String(i + 1).padStart(2, "0")}</span>
                        <div className="flex flex-col gap-[2px]">
                          <span className="text-[12px] tracking-[0.04em] text-[color:var(--siq-fg)]">
                            {z.city}, <span className="font-medium">{z.zip}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="h-[2px] bg-[color:var(--siq-fg)] transition-all duration-500" style={{ width: `${w}%` }} />
                            <span className="whitespace-nowrap text-[13px] text-[color:var(--siq-fg-muted)]">{fmt$(z.savings)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[13px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">{label}</span>
      <span style={{ color: highlight ? "var(--siq-fg)" : "var(--siq-fg-deep)" }}>{value}</span>
    </div>
  );
}
