import { useMemo, useState, useEffect, useRef } from "react";
import { RAW_DATA } from "@/data/cityData";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AR: "Arkansas", AZ: "Arizona", CA: "California", CO: "Colorado",
  FL: "Florida", HI: "Hawaii", IL: "Illinois", IN: "Indiana", MD: "Maryland",
  MO: "Missouri", NC: "North Carolina", NJ: "New Jersey", NV: "Nevada",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", TN: "Tennessee", TX: "Texas",
  VA: "Virginia", WA: "Washington",
};

const fmtNum = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n.toLocaleString());
const fmtKw = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + " MW" : n.toFixed(0) + " kW");

export function CityRankings() {
  const [state, setState] = useState("CA");
  const [visibleRows, setVisibleRows] = useState(0);
  const [barFills, setBarFills] = useState<number[]>([]);
  const [stripVisible, setStripVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const states = useMemo(
    () => Array.from(new Set(RAW_DATA.map((d) => d.state))).sort(),
    [],
  );

  const top5 = useMemo(() => {
    if (!state) return [];
    const byCity = new Map<string, (typeof RAW_DATA)[number]>();
    for (const d of RAW_DATA.filter((d) => d.state === state)) {
      const existing = byCity.get(d.city);
      if (!existing || d.install_count > existing.install_count) {
        byCity.set(d.city, d);
      }
    }
    return [...byCity.values()]
      .sort((a, b) => b.install_count - a.install_count)
      .slice(0, 5);
  }, [state]);

  const summary = useMemo(() => {
    if (top5.length === 0) return null;
    const totalInstalls = top5.reduce((s, d) => s + d.install_count, 0);
    const totalKw = top5.reduce((s, d) => s + d.total_kw_installed, 0);
    return { totalInstalls, totalKw, avgKw: totalKw / totalInstalls };
  }, [top5]);

  useEffect(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
    setVisibleRows(0);
    setBarFills(top5.map(() => 0));
    setStripVisible(false);
    if (top5.length === 0) return;

    const maxCount = top5[0].install_count;
    top5.forEach((d, i) => {
      timerRef.current.push(
        setTimeout(() => {
          setVisibleRows((v) => Math.max(v, i + 1));
          timerRef.current.push(
            setTimeout(() => {
              setBarFills((prev) => {
                const next = [...prev];
                next[i] = (d.install_count / maxCount) * 100;
                return next;
              });
            }, 80),
          );
        }, 30 + i * 80),
      );
    });
    timerRef.current.push(setTimeout(() => setStripVisible(true), 330));

    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [top5]);

  return (
    // KEY FIX: removed `min-h-0 flex-1` — these were causing the section to be
    // capped at the snap-scroll viewport height, clipping the summary strip.
    // Now the section grows to its natural content height and scrolls freely.
    <section className="siq-fade-in flex flex-col overflow-y-auto border-b border-[rgba(53,88,60,0.2)] px-12 py-6 pb-16">
      <div className="mb-6 flex shrink-0 flex-wrap items-baseline justify-between gap-4 border-b border-[rgba(53,88,60,0.2)] pb-4">
        <div>
          <p className="mb-1 text-[13px] uppercase tracking-[0.25em] text-[color:var(--siq-fg)]">
            City rankings
          </p>
          <h2 className="font-sans-siq text-[clamp(26px,3.5vw,50px)] leading-[1.1] text-[color:var(--siq-fg-deep)]">
            Top 5 Cities by Permit Volume
          </h2>
        </div>
      </div>

      <div className="mb-5 flex shrink-0 flex-wrap items-center gap-6">
        <div className="relative">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="min-w-[200px] cursor-pointer appearance-none border border-[rgba(53,88,60,0.2)] bg-transparent py-3 pl-5 pr-12 font-mono-siq text-[12px] tracking-[0.12em] text-[color:var(--siq-fg-deep)] outline-none transition-colors hover:bg-[rgba(53,88,60,0.06)]"
          >
            <option value="">— Select a State —</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {STATE_NAMES[s] || s} ({s})
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-[color:var(--siq-fg)]">
            ↓
          </span>
        </div>
        {state && (
          <span className="font-sans-siq text-2xl italic text-[color:var(--siq-fg)]">
            {STATE_NAMES[state] || state}
          </span>
        )}
      </div>

      {!state ? (
        <div className="border border-[rgba(53,88,60,0.1)] p-12 text-center text-[12px] tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
          Select a state above to view city rankings
        </div>
      ) : top5.length === 0 ? (
        <div className="border border-[rgba(53,88,60,0.1)] p-12 text-center text-[12px] tracking-[0.1em] text-[color:var(--siq-fg-muted)]">
          No data available for this state
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {top5.map((d, i) => {
              const kwLabel =
                d.total_kw_installed >= 1000
                  ? (d.total_kw_installed / 1000).toFixed(2) + " megawatts"
                  : d.total_kw_installed.toFixed(2) + " kilowatts";
              const visible = i < visibleRows;
              return (
                <div
                  key={`${d.city}-${i}`}
                  className="group grid grid-cols-[2rem_1fr_auto] items-center gap-6 border-b border-[rgba(53,88,60,0.12)] py-4 transition-all duration-500"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-20px)",
                  }}
                >
                  <span className="font-sans-siq text-[1.2rem] text-right text-[rgba(53,88,60,0.4)]">
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-2.5">
                    <span className="truncate font-sans-siq text-[1.4rem] text-[color:var(--siq-fg-deep)]">
                      {d.city}
                    </span>
                    <div className="relative h-2.5 cursor-pointer bg-[rgba(53,88,60,0.12)]">
                      <div
                        className="relative h-full overflow-visible bg-[color:var(--siq-fg)] transition-[width] duration-[900ms] ease-out"
                        style={{ width: `${barFills[i] ?? 0}%` }}
                      >
                        <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap bg-[color:var(--siq-fg)] px-3 py-2 font-mono-siq text-[13px] tracking-[0.08em] text-[color:var(--siq-cream)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          ⚡ {kwLabel}
                          <span
                            className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent"
                            style={{ borderTopColor: "var(--siq-fg)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-sans-siq text-[2rem] leading-none text-[color:var(--siq-fg-deep)]">
                      {fmtNum(d.install_count)}
                    </span>
                    <span className="text-[12px] uppercase tracking-[0.2em] text-[rgba(26,26,24,0.45)]">
                      Permits
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {summary && (
            <div
              className="mt-6 grid border border-[rgba(53,88,60,0.2)] transition-all duration-700 ease-out"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                opacity: stripVisible ? 1 : 0,
                transform: stripVisible ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {[
                { val: String(top5.length), desc: "Cities in Ranking" },
                { val: fmtNum(summary.totalInstalls), desc: "Total Permits (Top 5)" },
                { val: fmtKw(summary.totalKw), desc: "Combined Capacity" },
                { val: summary.avgKw.toFixed(1) + " kW", desc: "Avg per Install" },
              ].map((c, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 border-r border-[rgba(53,88,60,0.2)] p-6 last:border-r-0"
                >
                  <span className="font-sans-siq text-[1.8rem] text-[color:var(--siq-fg)]">
                    {c.val}
                  </span>
                  <span className="text-[12px] uppercase tracking-[0.18em] text-[rgba(26,26,24,0.5)]">
                    {c.desc}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}