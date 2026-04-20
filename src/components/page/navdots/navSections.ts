export type NavSection = {
  label: string;
  /** Index of the real section in the scroll container. */
  idx: number;
};

// Nav dots map to sections in the scroll container.
// Keep this list in the same order as `SolarIQPage.tsx`.
export const NAV_SECTIONS: NavSection[] = [
  { label: "Hero", idx: 0 },
  { label: "Intro", idx: 1 },
  { label: "Atlas bridge", idx: 2 },
  { label: "Atlas", idx: 3 },
  { label: "Cities bridge", idx: 4 },
  { label: "Calculator", idx: 5 },
  { label: "Top cities", idx: 6 },
  { label: "City rankings", idx: 7 },
  { label: "Seasonality bridge", idx: 8 },
  { label: "Seasonality", idx: 9 },
  { label: "Installers bridge", idx: 10 },
  { label: "Installers", idx: 11 },
];

