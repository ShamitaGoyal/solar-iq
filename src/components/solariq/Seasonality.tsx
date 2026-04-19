import { useEffect, useRef, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { SEASONALITY_DATA } from "@/data/seasonalityData";

const SEASON_DATA = SEASONALITY_DATA.map((d) => ({ ...d }));

const SEASONS: Record<string, { months: number[]; color: string; label: string; bandColor: string }> = {
  Winter: { months: [12, 1, 2], color: "#8bafd4", label: "Dec · Jan · Feb", bandColor: "rgba(139,175,212,0.55)" },
  Spring: { months: [3, 4, 5], color: "#a8e890", label: "Mar · Apr · May", bandColor: "rgba(168,232,144,0.45)" },
  Summer: { months: [6, 7, 8], color: "#d4a84b", label: "Jun · Jul · Aug", bandColor: "rgba(212,168,75,0.55)" },
  Fall: { months: [9, 10, 11], color: "#c87a40", label: "Sep · Oct · Nov", bandColor: "rgba(200,122,64,0.55)" },
};

const SEASON_BY_MONTH: Record<number, string> = {};
Object.entries(SEASONS).forEach(([s, v]) => v.months.forEach((m) => (SEASON_BY_MONTH[m] = s)));

const installs = SEASON_DATA.map((d) => d.installs);
const maxVal = Math.max(...installs);
const movingAvg = installs.map((v, i) => {
  const prev = installs[(i + 11) % 12];
  const next = installs[(i + 1) % 12];
  return Math.round((prev + v + next) / 3);
});

const chartData = SEASON_DATA.map((d, i) => ({
  name: d.name,
  installs: d.installs,
  avg: movingAvg[i],
  color: SEASONS[SEASON_BY_MONTH[d.month]].color,
  isMax: d.installs === maxVal,
}));

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="rounded border px-4 py-3 font-mono-siq text-[13px]"
      style={{
        background: "#1e3325",
        borderColor: "rgba(255,255,255,0.1)",
        color: "#FCFAEF",
      }}
    >
      <div className="mb-2 font-sans-siq text-[17px]">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="mt-1 flex items-center justify-between gap-6">
          <span className="flex items-center text-[13px] uppercase tracking-[0.08em] text-[rgba(252,250,239,0.45)]">
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full"
              style={{ background: p.color || p.payload.color }}
            />
            {p.name}
          </span>
          <span className="font-medium text-[#a8e890]">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function SeasonBubble({ name, season, delay }: { name: string; season: typeof SEASONS[string]; delay: number }) {
  const [visible, setVisible] = useState(false);
  const [typedLabel, setTypedLabel] = useState("");
  const [doneTyping, setDoneTyping] = useState(false);
  const [count, setCount] = useState(0);

  const months = season.months.map((m) => SEASON_DATA.find((x) => x.month === m)?.installs || 0);
  const avg = Math.round(months.reduce((a, b) => a + b, 0) / months.length);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const tick = () => {
      if (i < season.label.length) {
        setTypedLabel(season.label.slice(0, i + 1));
        i++;
        setTimeout(tick, 38);
      } else {
        setDoneTyping(true);
        // count up
        const start = Date.now();
        const dur = 900;
        const step = () => {
          const elapsed = Date.now() - start;
          const p = Math.min(elapsed / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setCount(Math.round(ease * avg));
          if (p < 1) requestAnimationFrame(step);
        };
        step();
      }
    };
    tick();
  }, [visible, season.label, avg]);

  return (
    <div
      className="flex-1 rounded-xl border px-5 py-4 transition-all duration-500"
      style={{
        minWidth: 160,
        background: "#2a4530",
        borderColor: "rgba(255,255,255,0.1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <div className="h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: season.color }} />
        <div className="text-[12px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.45)]">{name}</div>
      </div>
      <div className="mb-3 min-h-[1.4em] text-[13px] text-[rgba(255,255,255,0.7)]">
        {typedLabel}
        {!doneTyping && <span className="ml-px animate-pulse text-[#a8e890]">|</span>}
      </div>
      <div className="mb-3 h-px bg-[rgba(255,255,255,0.08)]" />
      <div className="font-sans-siq text-[34px] leading-none text-[#a8e890]">
        {count > 0 ? count.toLocaleString() : "—"}
      </div>
      <div className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.35)]">
        Avg monthly installs
      </div>
    </div>
  );
}

export function Seasonality() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Observe against the snap scroll root — default (viewport) IO is wrong for overflow scroll parents.
    const scrollRoot = el.closest(".siq-scroll-root");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setInView(true);
        });
      },
      { root: scrollRoot instanceof Element ? scrollRoot : null, threshold: [0, 0.05, 0.15], rootMargin: "0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="flex h-full flex-col" style={{ background: "#35583C", color: "#FCFAEF" }}>
      <div className="flex h-full flex-col px-12 py-6">
        <div className="siq-fade-in border-b pb-6" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <h2 className="font-sans-siq text-[clamp(30px,4vw,52px)] font-normal leading-[1.05]">
            Install <em className="italic text-[#a8e890]">Volume</em> by Month
          </h2>
        </div>

        <div
          ref={ref}
          className="siq-fade-in mt-4 min-h-0 flex-1 border flex flex-col"
          style={{ background: "#2a4530", borderColor: "rgba(255,255,255,0.08)" }}
        >
          {/* Season strip */}
          <div className="grid h-[5px] shrink-0 grid-cols-12 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {SEASON_DATA.map((d) => (
              <div key={d.month} style={{ background: SEASONS[SEASON_BY_MONTH[d.month]].bandColor }} />
            ))}
          </div>

          <div className="min-h-0 flex-1">
            {inView && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 28, right: 30, bottom: 16, left: 30 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "rgba(255,255,255,0.55)", fontFamily: "DM Mono, monospace", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.45)", fontFamily: "DM Mono, monospace", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                  <Bar dataKey="installs" name="Installs" barSize={32} radius={[2, 2, 0, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.color} fillOpacity={d.isMax ? 1 : 0.68} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="3-Mo Avg"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: "rgba(255,255,255,0.7)", stroke: "#2a4530", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(SEASONS).map(([name, s], idx) => (
            <SeasonBubble key={name} name={name} season={s} delay={inView ? 600 + idx * 220 : 99999} />
          ))}
        </div>
      </div>
    </section>
  );
}
