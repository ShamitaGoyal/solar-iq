import { useEffect, useMemo, useRef, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { OPPORTUNITY_CITIES, SATURATION_LEADERS } from "@/data/marketOpportunity";
import type { MarketTier, OpportunityCity } from "@/data/marketOpportunity";
import { CITY_COORDS } from "@/data/cityCoords";

const fmtKw = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + " MW" : n.toFixed(1) + " kW");
const fmtNum = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));

const TIER_STYLES: Record<MarketTier, { badge: string; fill: string; stroke: string }> = {
  HIGH:   { badge: "bg-[rgba(74,122,58,0.12)] text-[#3a6830]",  fill: "#4a7a3a", stroke: "#2d5122" },
  MEDIUM: { badge: "bg-[rgba(138,112,64,0.12)] text-[#7a6030]", fill: "#b89040", stroke: "#8a6820" },
  LOW:    { badge: "bg-[rgba(100,100,100,0.1)] text-[#888]",    fill: "#aaaaaa", stroke: "#888888" },
};

const TIER_ORDER: MarketTier[] = ["LOW", "MEDIUM", "HIGH"];
type FilterTab = "ALL" | MarketTier;
const TABS: FilterTab[] = ["ALL", "HIGH", "MEDIUM", "LOW"];

const SVG_W = 960;
const SVG_H = 580;
const ZOOM_SCALE = 4;

type StateFeature = Feature<Geometry, { id: string }>;

interface ProjectedCity { city: OpportunityCity; x: number; y: number }
interface TooltipState { city: OpportunityCity; x: number; y: number }

function TierBadge({ tier }: { tier: MarketTier }) {
  const s = TIER_STYLES[tier];
  return (
    <span className={`inline-block rounded-sm px-[6px] py-[2px] font-mono-siq text-[10px] uppercase tracking-[0.14em] ${s.badge}`}>
      {tier}
    </span>
  );
}

function TooltipCard({
  tooltip,
  svgRef,
}: {
  tooltip: TooltipState;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const w = svgRef.current?.getBoundingClientRect().width ?? 800;
  const isRight = tooltip.x > w * 0.65;
  return (
    <div
      className="pointer-events-none absolute z-10 min-w-[180px] rounded border border-[rgba(53,88,60,0.15)] bg-[color:var(--siq-cream)] px-3 py-2.5 shadow-md"
      style={{
        left: isRight ? tooltip.x - 12 : tooltip.x + 12,
        top: tooltip.y - 10,
        transform: isRight ? "translateX(-100%)" : undefined,
      }}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="font-mono-siq text-[13px] text-[color:var(--siq-fg)]">
          {tooltip.city.city.charAt(0) + tooltip.city.city.slice(1).toLowerCase()}
        </span>
        <span className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
          {tooltip.city.state}
        </span>
      </div>
      <TierBadge tier={tooltip.city.tier} />
      <div className="mt-2 space-y-1">
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-[color:var(--siq-fg-muted)]">Score</span>
          <span className="font-mono-siq text-[color:var(--siq-fg)]">{tooltip.city.score}</span>
        </div>
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-[color:var(--siq-fg-muted)]">Installs</span>
          <span className="font-mono-siq text-[color:var(--siq-fg)]">{fmtNum(tooltip.city.install_count)}</span>
        </div>
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-[color:var(--siq-fg-muted)]">Avg system</span>
          <span className="font-mono-siq text-[color:var(--siq-fg)]">{fmtKw(tooltip.city.avg_kw)}</span>
        </div>
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="text-[color:var(--siq-fg-muted)]">$/capita</span>
          <span className="font-mono-siq text-[color:var(--siq-fg)]">${tooltip.city.state_pc.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function OpportunityIndex() {
  const [activeTab, setActiveTab]           = useState<FilterTab>("ALL");
  const [statesGeo, setStatesGeo]           = useState<StateFeature[] | null>(null);
  const [meshPath, setMeshPath]             = useState<string>("");
  const [hoverTooltip, setHoverTooltip]     = useState<TooltipState | null>(null);
  const [pinnedTooltip, setPinnedTooltip]   = useState<TooltipState | null>(null);
  const [selectedKey, setSelectedKey]       = useState<string | null>(null);
  const [mapTransform, setMapTransform]     = useState({ scale: 1, tx: 0, ty: 0 });
  const svgRef        = useRef<SVGSVGElement>(null);
  const selectedRowRef = useRef<HTMLDivElement>(null);

  const projection = useMemo(() => geoAlbersUsa().scale(1280).translate([480, 290]), []);
  const pathGen    = useMemo(() => geoPath(projection), [projection]);

  useEffect(() => {
    let cancelled = false;
    fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
      .then((r) => r.json())
      .then((us: any) => {
        if (cancelled) return;
        const fc = feature(us, us.objects.states) as unknown as FeatureCollection<Geometry, { id: string }>;
        const m  = mesh(us, us.objects.states, (a: any, b: any) => a !== b);
        setStatesGeo(fc.features as StateFeature[]);
        setMeshPath(pathGen(m as any) || "");
      })
      .catch((e) => console.error("Opportunity map load failed", e));
    return () => { cancelled = true; };
  }, [pathGen]);

  // Reset everything when tab changes
  useEffect(() => {
    setMapTransform({ scale: 1, tx: 0, ty: 0 });
    setSelectedKey(null);
    setHoverTooltip(null);
    setPinnedTooltip(null);
  }, [activeTab]);

  // Scroll selected row into view (handles selection from map dot click)
  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedKey]);

  const counts = useMemo(() => ({
    HIGH:   OPPORTUNITY_CITIES.filter((c) => c.tier === "HIGH").length,
    MEDIUM: OPPORTUNITY_CITIES.filter((c) => c.tier === "MEDIUM").length,
    LOW:    OPPORTUNITY_CITIES.filter((c) => c.tier === "LOW").length,
  }), []);

  const filteredCities = useMemo(
    () => activeTab === "ALL" ? OPPORTUNITY_CITIES : OPPORTUNITY_CITIES.filter((c) => c.tier === activeTab),
    [activeTab],
  );

  const projectedByTier = useMemo<Record<MarketTier, ProjectedCity[]>>(() => {
    const result: Record<MarketTier, ProjectedCity[]> = { HIGH: [], MEDIUM: [], LOW: [] };
    for (const city of OPPORTUNITY_CITIES) {
      const coords = CITY_COORDS[`${city.city}__${city.state}`];
      if (!coords) continue;
      const pt = projection(coords);
      if (!pt) continue;
      result[city.tier].push({ city, x: pt[0], y: pt[1] });
    }
    return result;
  }, [projection]);

  function zoomToCity(city: OpportunityCity) {
    const key    = `${city.city}__${city.state}`;
    const coords = CITY_COORDS[key];
    if (!coords) return;
    const pt = projection(coords);
    if (!pt) return;

    const tx = SVG_W / 2 - ZOOM_SCALE * pt[0];
    const ty = SVG_H / 2 - ZOOM_SCALE * pt[1];
    setMapTransform({ scale: ZOOM_SCALE, tx, ty });

    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setHoverTooltip(null);
      setPinnedTooltip({ city, x: rect.width / 2, y: rect.height / 2 });
    }
  }

  function handleListClick(city: OpportunityCity) {
    const key = `${city.city}__${city.state}`;
    if (selectedKey === key) {
      // Deselect — reset zoom
      setSelectedKey(null);
      setMapTransform({ scale: 1, tx: 0, ty: 0 });
      setPinnedTooltip(null);
      return;
    }
    setSelectedKey(key);
    zoomToCity(city);
  }

  function handleDotClick(city: OpportunityCity) {
    const key = `${city.city}__${city.state}`;
    if (selectedKey === key) {
      setSelectedKey(null);
      setMapTransform({ scale: 1, tx: 0, ty: 0 });
      setPinnedTooltip(null);
      return;
    }
    setSelectedKey(key);
    // Switch panel to the city's tier if we're on ALL
    if (activeTab !== city.tier) setActiveTab(city.tier);
    zoomToCity(city);
  }

  function handleMapBgClick() {
    if (!selectedKey) return;
    setSelectedKey(null);
    setMapTransform({ scale: 1, tx: 0, ty: 0 });
    setPinnedTooltip(null);
  }

  function handleDotHover(e: React.MouseEvent, city: OpportunityCity) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverTooltip({ city, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  function renderDots(tier: MarketTier) {
    const cities  = projectedByTier[tier];
    const dimmed  = activeTab !== "ALL" && activeTab !== tier;
    const { fill, stroke } = TIER_STYLES[tier];
    const s = mapTransform.scale;
    const baseR = 3 / s;

    return cities.map(({ city, x, y }) => {
      const key        = `${city.city}__${city.state}`;
      const isSelected = selectedKey === key;
      const r          = isSelected ? baseR + 1.5 / s : baseR;

      return (
        <g key={key}>
          {isSelected && (
            <circle cx={x} cy={y} r={r + 3 / s} fill="none" stroke="white" strokeWidth={1.5 / s} opacity={0.85} />
          )}
          <circle
            cx={x} cy={y} r={r}
            fill={fill}
            stroke={isSelected ? "white" : stroke}
            strokeWidth={(isSelected ? 1.5 : 0.8) / s}
            opacity={dimmed ? 0.12 : isSelected ? 1 : 0.88}
            style={{ cursor: dimmed ? "default" : "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => !dimmed && handleDotHover(e, city)}
            onMouseLeave={() => setHoverTooltip(null)}
            onClick={(e) => { e.stopPropagation(); if (!dimmed) handleDotClick(city); }}
          />
        </g>
      );
    });
  }

  const visibleTooltip = hoverTooltip ?? pinnedTooltip;

  return (
    <section className="siq-fade-in flex h-full flex-col border-b border-[rgba(53,88,60,0.1)] px-12 py-6">
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between border-b border-[rgba(53,88,60,0.1)] pb-4">
        <div>
          <h2 className="font-sans-siq text-[clamp(28px,3.5vw,48px)] font-normal leading-[1.05]">
            Untapped <em className="not-italic italic text-[color:var(--siq-fg)]">Market</em> Opportunity
          </h2>
          <p className="mt-1 text-[13px] leading-[1.6] text-[color:var(--siq-fg-muted)]">
            Markets ranked by solar viability × system size, weighted against current permit installations.
          </p>
        </div>
        <div className="flex gap-4 text-right">
          {(["HIGH", "MEDIUM", "LOW"] as MarketTier[]).map((t) => (
            <div key={t}>
              <div className={`font-sans-siq text-[28px] leading-none ${t === "HIGH" ? "text-[#3a6830]" : t === "MEDIUM" ? "text-[#7a6030]" : "text-[color:var(--siq-fg-muted)]"}`}>
                {counts[t]}
              </div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
        {/* Map column */}
        <div className="flex min-h-0 flex-col">
          <div className="mb-3 flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 font-mono-siq text-[12px] uppercase tracking-[0.12em] transition-colors ${
                  activeTab === tab
                    ? "bg-[color:var(--siq-fg)] text-[color:var(--siq-cream)]"
                    : "border border-[rgba(53,88,60,0.2)] text-[color:var(--siq-fg-muted)] hover:border-[color:var(--siq-fg)] hover:text-[color:var(--siq-fg)]"
                }`}
              >
                {tab === "ALL" ? `All (${OPPORTUNITY_CITIES.length})` : `${tab} (${counts[tab as MarketTier]})`}
              </button>
            ))}
          </div>

          <div className="relative min-h-0 flex-1">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="h-full w-full"
              style={{ display: "block" }}
              onMouseLeave={() => setHoverTooltip(null)}
              onClick={handleMapBgClick}
            >
              <g
                style={{
                  transform: `translate(${mapTransform.tx}px,${mapTransform.ty}px) scale(${mapTransform.scale})`,
                  transformOrigin: "0 0",
                  transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {statesGeo?.map((f) => (
                  <path
                    key={(f.properties as any).id ?? JSON.stringify(f.geometry).slice(0, 20)}
                    d={pathGen(f) || ""}
                    fill="rgba(53,88,60,0.06)"
                    stroke="none"
                  />
                ))}
                {meshPath && (
                  <path d={meshPath} fill="none" stroke="rgba(53,88,60,0.18)" strokeWidth={0.6} />
                )}
                {TIER_ORDER.map((tier) => (
                  <g key={tier}>{renderDots(tier)}</g>
                ))}
              </g>
            </svg>

            {visibleTooltip && <TooltipCard tooltip={visibleTooltip} svgRef={svgRef} />}

            {selectedKey && (
              <button
                onClick={handleMapBgClick}
                className="absolute right-2 top-2 rounded border border-[rgba(53,88,60,0.2)] bg-[color:var(--siq-cream)] px-2 py-1 font-mono-siq text-[10px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)] transition-colors hover:text-[color:var(--siq-fg)]"
              >
                Reset zoom
              </button>
            )}

            <div className="absolute bottom-2 left-3 flex items-center gap-4">
              {(["HIGH", "MEDIUM", "LOW"] as MarketTier[]).map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" fill={TIER_STYLES[t].fill} stroke={TIER_STYLES[t].stroke} strokeWidth="0.7" />
                  </svg>
                  <span className="font-mono-siq text-[10px] uppercase tracking-[0.12em] text-[color:var(--siq-fg-muted)]">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <aside className="flex min-h-0 flex-col border-l border-[rgba(53,88,60,0.1)] pl-8">
          <div className="shrink-0">
            <div className="mb-3 text-[12px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
              How It's Scored
            </div>
            <p className="text-[13px] leading-[1.75] text-[color:var(--siq-fg-deep)]">
              Score = percentile rank of{" "}
              <span className="font-medium text-[color:var(--siq-fg)]">solar viability × avg system size</span>
              , divided by current penetration. HIGH ≥ 70th percentile.
            </p>
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-[rgba(53,88,60,0.1)] pt-4">
            {activeTab === "ALL" ? (
              <>
                <div className="mb-3 shrink-0 text-[12px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
                  Most Penetrated Markets
                </div>
                <div className="space-y-2">
                  {SATURATION_LEADERS.map((c, i) => (
                    <div key={`sat-${c.city}__${c.state}`} className="flex items-center justify-between border-b border-[rgba(53,88,60,0.06)] pb-2 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-siq text-[11px] text-[color:var(--siq-fg-muted)]">{String(i + 1).padStart(2, "0")}</span>
                        <div className="text-[12px] text-[color:var(--siq-fg)]">
                          {c.city.charAt(0) + c.city.slice(1).toLowerCase()}, {c.state}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono-siq text-[13px] text-[color:var(--siq-fg-deep)]">{fmtNum(c.install_count)}</div>
                        <div className="text-[11px] text-[color:var(--siq-fg-muted)]">installs</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[12px] italic leading-[1.6] text-[color:var(--siq-fg-muted)]">
                  High install counts signal saturation — consider upsell or adjacent market expansion.
                </p>
              </>
            ) : (
              <>
                <div className="mb-2 shrink-0 text-[12px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
                  {activeTab} Markets · {filteredCities.length}
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain">
                  {filteredCities.map((city, i) => {
                    const key        = `${city.city}__${city.state}`;
                    const isSelected = selectedKey === key;
                    const hasCoords  = !!CITY_COORDS[key];
                    return (
                      <div
                        key={key}
                        ref={isSelected ? selectedRowRef : undefined}
                        onClick={() => handleListClick(city)}
                        className={`flex cursor-pointer items-center gap-2 border-b border-[rgba(53,88,60,0.06)] py-2 pr-1 transition-colors ${
                          isSelected
                            ? "bg-[rgba(53,88,60,0.08)]"
                            : "hover:bg-[rgba(53,88,60,0.04)]"
                        } ${!hasCoords ? "opacity-40" : ""}`}
                      >
                        <span className="w-5 shrink-0 font-mono-siq text-[10px] text-[color:var(--siq-fg-muted)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] text-[color:var(--siq-fg)]">
                            {city.city.charAt(0) + city.city.slice(1).toLowerCase()}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
                            {city.state}
                          </span>
                        </div>
                        <span className="shrink-0 font-mono-siq text-[11px] text-[color:var(--siq-fg-muted)]">
                          {city.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
