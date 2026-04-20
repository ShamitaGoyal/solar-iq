import { useRef, useState } from "react";
import { NAV_SECTIONS } from "./navdots/navSections";
import { NavDots } from "./navdots/NavDots";
import { useSolarIQScrollSpy } from "./ScrollSpy";
import { AtlasBridgeSection } from "./sections/AtlasBridgeSection";
import { AtlasSection } from "./sections/AtlasSection";
import { CalculatorSection } from "./sections/CalculatorSection";
import { CalculatorToCitiesSection } from "./sections/CalculatorToCitiesSection";
import { CitiesBridgeSection } from "./sections/CitiesBridgeSection";
import { CityRankingsSection } from "./sections/CityRankingsSection";
import { InstallersBridgeSection } from "./sections/InstallersBridgeSection";
import { LineRaceSection } from "./sections/LineRaceSection";
import { SeasonalityBridgeSection } from "./sections/SeasonalityBridgeSection";
import { SeasonalitySection } from "./sections/SeasonalitySection";
import { TransitionIntroSection } from "./sections/TransitionIntroSection";
import { Navbar } from "./sections/Navbar";
import { HeroSection } from "./sections/HeroSection";
import { SavingsAtlas } from "@/components/section-visuals/SavingsAtlas";
import { SavingsCalculator } from "@/components/section-visuals/SavingsCalculator";
import { CityRankings } from "@/components/section-visuals/CityRankings";
import { Seasonality } from "@/components/section-visuals/Seasonality";
import { LineRace } from "@/components/section-visuals/LineRace";

export function SolarIQPage() {
  const { scrollRef, setSectionRef: setRef, scrollToSection, activeNavIdx } = useSolarIQScrollSpy(NAV_SECTIONS);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const t1SectionRef = useRef<HTMLElement | null>(null);
  const t2SectionRef = useRef<HTMLElement | null>(null);
  const t4SectionRef = useRef<HTMLElement | null>(null);
  const t6SectionRef = useRef<HTMLElement | null>(null);
  const t8SectionRef = useRef<HTMLElement | null>(null);
  const t10SectionRef = useRef<HTMLElement | null>(null);
  const [zip, setZip] = useState("");
  const [billIn, setBillIn] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const onAnalyze = () => {
    if (zip.trim().length === 5 && billIn.trim()) {
      const v = parseInt(billIn, 10);
      setMsg({ text: `ZIP ${zip} analyzed — est. $${Math.round(v * 0.7)}/mo savings.`, ok: true });
    } else {
      setMsg({ text: "Enter a 5-digit ZIP and monthly bill.", ok: false });
    }
  };

  return (
    <div className="text-[color:var(--siq-fg-deep)]">
      Top navbar (SOLAR IQ + section links) — disabled for now
      <Navbar sections={NAV_SECTIONS} activeNavIdx={activeNavIdx} onJump={scrollToSection} />


      <NavDots sections={NAV_SECTIONS} activeNavIdx={activeNavIdx} onJump={scrollToSection} />

      <div ref={scrollRef} className="siq-scroll-root">
        {/* ── 0: HERO ── */}
        <HeroSection setRef={setRef} observeTargetRef={heroSectionRef} msg={msg} />

        {/* ── 1: TRANSITION — Introducing Solar IQ (dark, centered) ── */}
        <TransitionIntroSection setRef={setRef} observeTargetRef={t1SectionRef} />
        {/* ── 2: TRANSITION — Atlas bridge (cream, left) ── */}
        <AtlasBridgeSection setRef={setRef} observeTargetRef={t2SectionRef} />
        {/* ── 3: ATLAS — Savings Atlas (scrollable viz) ── */}
        <AtlasSection setRef={setRef}>
          <SavingsAtlas />
        </AtlasSection>
        {/* ── 4: TRANSITION — Zero in on cities (cream, left) ── */}
        <CitiesBridgeSection setRef={setRef} observeTargetRef={t4SectionRef} />
        {/* ── 5: CALCULATOR — Savings calculator ── */}
        <CalculatorSection setRef={setRef}>
          <SavingsCalculator />
        </CalculatorSection>
        {/* ── 6: TRANSITION — Calculator → cities (cream, centered) ── */}
        <CalculatorToCitiesSection setRef={setRef} observeTargetRef={t6SectionRef} />
        {/* ── 7: CITY RANKINGS — Drilldowns + rankings (scrollable) ── */}
        <CityRankingsSection setRef={setRef}>
          <CityRankings />
        </CityRankingsSection>
        {/* ── 8: TRANSITION — Capture customers (tan, left) ── */}
        <SeasonalityBridgeSection setRef={setRef} observeTargetRef={t8SectionRef} />
        {/* ── 9: SEASONALITY — Month-by-month volume trends ── */}
        <SeasonalitySection setRef={setRef}>
          <Seasonality />
        </SeasonalitySection>
        {/* ── 10: TRANSITION — Seasons → installers (dark, left) ── */}
        <InstallersBridgeSection setRef={setRef} observeTargetRef={t10SectionRef} />
        {/* ── 11: INSTALLERS — Line race + footer ── */}
        <LineRaceSection setRef={setRef}>
          <LineRace />
        </LineRaceSection>
      </div>

    </div>
  );
}
