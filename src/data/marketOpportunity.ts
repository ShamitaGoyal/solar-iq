import { RAW_DATA } from './cityData';
import { STATE_SAVINGS_DATA } from './stateSavings';

export type MarketTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface OpportunityCity {
  city: string;
  state: string;
  install_count: number;
  total_kw: number;
  avg_kw: number;
  state_pc: number;
  score: number; // 0–100 percentile rank among all tracked markets
  tier: MarketTier;
}

// Aggregate cityData by city+state (deduplicate exact duplicate rows)
const aggMap = new Map<string, { city: string; state: string; install_count: number; total_kw: number }>();
for (const row of RAW_DATA) {
  if (row.city.trim().length <= 3) continue; // skip obvious abbreviations (GPR, WM, OB, COL…)
  const key = `${row.city}__${row.state}`;
  const e = aggMap.get(key);
  if (e) {
    e.install_count += row.install_count;
    e.total_kw += row.total_kw_installed;
  } else {
    aggMap.set(key, { city: row.city, state: row.state, install_count: row.install_count, total_kw: row.total_kw_installed });
  }
}

const pcValues = Object.values(STATE_SAVINGS_DATA).map(v => v.pc).filter(v => v > 0);
const pcMin = Math.min(...pcValues);
const pcMax = Math.max(...pcValues);

interface RawEntry {
  city: string; state: string;
  install_count: number; total_kw: number; avg_kw: number; state_pc: number;
  raw: number;
}

const rawEntries: RawEntry[] = [];
for (const v of aggMap.values()) {
  const sd = STATE_SAVINGS_DATA[v.state];
  if (!sd || sd.pc === 0) continue;
  const avg_kw = v.total_kw / v.install_count;
  const solar_viability = (sd.pc - pcMin) / (pcMax - pcMin);
  // High viability × large avg system × low penetration = high opportunity
  const raw = (solar_viability * Math.log1p(avg_kw)) / Math.log1p(v.install_count);
  rawEntries.push({ city: v.city, state: v.state, install_count: v.install_count, total_kw: v.total_kw, avg_kw, state_pc: sd.pc, raw });
}

// Score = percentile rank (avoids outlier distortion from single-install cities)
const sorted = [...rawEntries].sort((a, b) => a.raw - b.raw);
const rankMap = new Map(sorted.map((e, i) => [
  `${e.city}__${e.state}`,
  sorted.length > 1 ? Math.round((i / (sorted.length - 1)) * 100) : 50,
]));

function tier(score: number): MarketTier {
  if (score >= 70) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

export const OPPORTUNITY_CITIES: OpportunityCity[] = rawEntries
  .map(e => {
    const score = rankMap.get(`${e.city}__${e.state}`) ?? 50;
    return {
      city: e.city,
      state: e.state,
      install_count: e.install_count,
      total_kw: Math.round(e.total_kw * 10) / 10,
      avg_kw: Math.round(e.avg_kw * 10) / 10,
      state_pc: e.state_pc,
      score,
      tier: tier(score),
    };
  })
  .sort((a, b) => b.score - a.score);

export const SATURATION_LEADERS: OpportunityCity[] = [...OPPORTUNITY_CITIES]
  .sort((a, b) => b.install_count - a.install_count)
  .slice(0, 8);
