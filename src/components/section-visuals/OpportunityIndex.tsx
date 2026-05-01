import { useMemo, useState } from "react";
import { OPPORTUNITY_CITIES, SATURATION_LEADERS } from "@/data/marketOpportunity";
import type { MarketTier, OpportunityCity } from "@/data/marketOpportunity";

const fmtKw = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + " MW" : n.toFixed(1) + " kW");
const fmtNum = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);

const TIER_STYLES: Record<MarketTier, { badge: string; bar: string; dot: string }> = {
  HIGH:   { badge: "bg-[rgba(74,122,58,0.12)] text-[#3a6830]",   bar: "bg-[#4a7a3a]",   dot: "bg-[#4a7a3a]" },
  MEDIUM: { badge: "bg-[rgba(138,112,64,0.12)] text-[#7a6030]",  bar: "bg-[#b89040]",   dot: "bg-[#b89040]" },
  LOW:    { badge: "bg-[rgba(100,100,100,0.1)] text-[#888]",     bar: "bg-[#bbb]",      dot: "bg-[#ccc]" },
};

type FilterTab = 'ALL' | MarketTier;

const TABS: FilterTab[] = ['ALL', 'HIGH', 'MEDIUM', 'LOW'];

function TierBadge({ tier }: { tier: MarketTier }) {
  const s = TIER_STYLES[tier];
  return (
    <span className={`inline-block rounded-sm px-[6px] py-[2px] font-mono-siq text-[10px] uppercase tracking-[0.14em] ${s.badge}`}>
      {tier}
    </span>
  );
}

function ScoreBar({ score, tier }: { score: number; tier: MarketTier }) {
  return (
    <div className="relative h-[4px] w-full overflow-hidden rounded-full bg-[rgba(53,88,60,0.08)]">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${TIER_STYLES[tier].bar}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function CityRow({ city, rank }: { city: OpportunityCity; rank: number }) {
  return (
    <div className="grid grid-cols-[22px_1fr_60px_80px_52px_56px_60px] items-center gap-2 border-b border-[rgba(53,88,60,0.08)] py-2.5 text-[13px]">
      <span className="text-right font-mono-siq text-[12px] text-[color:var(--siq-fg-muted)]">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <div className="truncate font-mono-siq text-[13px] tracking-[0.02em] text-[color:var(--siq-fg)]">
          {city.city.charAt(0) + city.city.slice(1).toLowerCase()}
        </div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)]">{city.state}</div>
      </div>
      <TierBadge tier={city.tier} />
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <ScoreBar score={city.score} tier={city.tier} />
        </div>
        <span className="w-[24px] shrink-0 text-right font-mono-siq text-[12px] text-[color:var(--siq-fg-muted)]">
          {city.score}
        </span>
      </div>
      <span className="text-right font-mono-siq text-[12px] text-[color:var(--siq-fg-muted)]">
        {fmtNum(city.install_count)}
      </span>
      <span className="text-right font-mono-siq text-[12px] text-[color:var(--siq-fg-muted)]">
        {fmtKw(city.avg_kw)}
      </span>
      <span className="text-right font-mono-siq text-[12px] text-[color:var(--siq-fg-muted)]">
        ${city.state_pc.toLocaleString()}
      </span>
    </div>
  );
}

export function OpportunityIndex() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const filtered = useMemo(
    () => activeTab === 'ALL' ? OPPORTUNITY_CITIES : OPPORTUNITY_CITIES.filter(c => c.tier === activeTab),
    [activeTab],
  );

  const counts = useMemo(() => ({
    HIGH: OPPORTUNITY_CITIES.filter(c => c.tier === 'HIGH').length,
    MEDIUM: OPPORTUNITY_CITIES.filter(c => c.tier === 'MEDIUM').length,
    LOW: OPPORTUNITY_CITIES.filter(c => c.tier === 'LOW').length,
  }), []);

  return (
    <section className="siq-fade-in flex h-full flex-col border-b border-[rgba(53,88,60,0.1)] px-12 py-6">
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between border-b border-[rgba(53,88,60,0.1)] pb-4">
        <div>
          <h2 className="font-sans-siq text-[clamp(28px,3.5vw,48px)] font-normal leading-[1.05]">
            Untapped <em className="not-italic italic text-[color:var(--siq-fg)]">Market</em> Opportunity
          </h2>
          <p className="mt-1 text-[13px] leading-[1.6] text-[color:var(--siq-fg-muted)]">
            Markets ranked by solar viability × system size, weighted against current ZenPower penetration.
          </p>
        </div>
        <div className="flex gap-4 text-right">
          {(["HIGH", "MEDIUM", "LOW"] as MarketTier[]).map(t => (
            <div key={t}>
              <div className={`font-sans-siq text-[28px] leading-none ${TIER_STYLES[t].badge.includes("3a6830") ? "text-[#3a6830]" : t === "MEDIUM" ? "text-[#7a6030]" : "text-[color:var(--siq-fg-muted)]"}`}>
                {counts[t]}
              </div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--siq-fg-muted)]">{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
        {/* Main ranked list */}
        <div className="flex min-h-0 flex-col">
          {/* Filter tabs */}
          <div className="mb-4 flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 font-mono-siq text-[12px] uppercase tracking-[0.12em] transition-colors ${
                  activeTab === tab
                    ? "bg-[color:var(--siq-fg)] text-[color:var(--siq-cream)]"
                    : "border border-[rgba(53,88,60,0.2)] text-[color:var(--siq-fg-muted)] hover:border-[color:var(--siq-fg)] hover:text-[color:var(--siq-fg)]"
                }`}
              >
                {tab === 'ALL' ? `All (${OPPORTUNITY_CITIES.length})` : `${tab} (${counts[tab as MarketTier]})`}
              </button>
            ))}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[22px_1fr_60px_80px_52px_56px_60px] items-center gap-2 border-b border-[rgba(53,88,60,0.15)] pb-2 text-[11px] uppercase tracking-[0.13em] text-[color:var(--siq-fg-muted)]">
            <span />
            <span>Market</span>
            <span>Tier</span>
            <span>Opportunity</span>
            <span className="text-right">Installs</span>
            <span className="text-right">Avg kW</span>
            <span className="text-right">$/cap</span>
          </div>

          {/* Rows */}
          <div className="overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            {filtered.map((city, i) => (
              <CityRow key={`${city.city}__${city.state}`} city={city} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <aside className="flex flex-col gap-6 border-l border-[rgba(53,88,60,0.1)] pl-8">
          <div>
            <div className="mb-3 text-[12px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
              How It's Scored
            </div>
            <p className="text-[13px] leading-[1.75] text-[color:var(--siq-fg-deep)]">
              Score = percentile rank of{" "}
              <span className="font-medium text-[color:var(--siq-fg)]">solar viability × avg system size</span>
              , divided by current penetration. HIGH ≥ 70th percentile.
            </p>
          </div>

          <div className="border-t border-[rgba(53,88,60,0.1)] pt-5">
            <div className="mb-3 text-[12px] uppercase tracking-[0.17em] text-[color:var(--siq-fg-muted)]">
              Most Penetrated Markets
            </div>
            <div className="space-y-2">
              {SATURATION_LEADERS.map((c, i) => (
                <div key={`sat-${c.city}__${c.state}`} className="flex items-center justify-between border-b border-[rgba(53,88,60,0.06)] pb-2 text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-siq text-[11px] text-[color:var(--siq-fg-muted)]">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <div className="text-[12px] text-[color:var(--siq-fg)]">
                        {c.city.charAt(0) + c.city.slice(1).toLowerCase()}, {c.state}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-siq text-[13px] text-[color:var(--siq-fg-deep)]">
                      {fmtNum(c.install_count)}
                    </div>
                    <div className="text-[11px] text-[color:var(--siq-fg-muted)]">installs</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] italic leading-[1.6] text-[color:var(--siq-fg-muted)]">
              High install counts signal saturation — consider upsell or adjacent market expansion.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
