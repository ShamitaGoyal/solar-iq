import { createFileRoute } from "@tanstack/react-router";
import { SolarIQPage } from "@/components/solariq/SolarIQPage";

export const Route = createFileRoute("/")({
  component: SolarIQPage,
  head: () => ({
    meta: [
      { title: "Solar IQ — See what your home could save with solar" },
      {
        name: "description",
        content:
          "Cross-reference real permit data, irradiance scores, and utility rates to see exactly what solar could save your household.",
      },
      { property: "og:title", content: "Solar IQ — Solar intelligence for your home" },
      {
        property: "og:description",
        content: "Real permit data, irradiance scores, and utility rates — personalized solar savings.",
      },
    ],
  }),
});
