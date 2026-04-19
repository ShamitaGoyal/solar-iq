This document maps each site visualization to the exact data columns it consumes, tracing from raw source → pipeline output → TypeScript module → component.

---

## CityRankings (`src/components/solariq/CityRankings.tsx`)

**What it shows:** A bar chart of the top cities by solar install count and total installed capacity, filterable by state.

**Data module:** `src/data/cityData.ts` → `RAW_DATA: CityRecord[]`

**Source file:** `data/output/city_savings_potential.csv`

**Original data sources:** ZenPower permit `records.csv` + installer CSVs (Sullivan, Titan, Sunrun, Freedom Forever)

| Field used | Source column | How it's used |
| --- | --- | --- |
| `city` | `city` | Label on each bar |
| `state` | `state` | State filter dropdown |
| `install_count` | `install_count` | Bar width (ranked + normalized to top city); displayed as count |
| `total_kw_installed` | `total_kw_installed` | Displayed as kW or MW in the detail card |

---

## Seasonality (`src/components/solariq/Seasonality.tsx`)

**What it shows:** A radial or bar chart of total solar installs aggregated by month-of-year, showing seasonal installation patterns.

**Data module:** `src/data/seasonalityData.ts` → `SEASONALITY_DATA`

**Source file:** `data/output/seasonality.csv`

**Original data sources:** ZenPower `records.csv` + installer CSVs, date fields aggregated across all years

| Field used | Source column | How it's used |
| --- | --- | --- |
| `month` | `month` | X-axis / angular position |
| `name` | `month_name` | Month label (Jan–Dec) |
| `installs` | `total_installs` | Bar/spoke height; total installs in that month across all years |

---

## LineRace (`src/components/solariq/LineRace.tsx`)

**What it shows:** An animated racing line chart of cumulative solar installs per year, with one line per installer/source.

**Data module:** `src/data/timelineData.ts` → `TIMELINE_BY_YEAR: Record<number, Record<string, number>>`

**Source file:** `data/output/timeline_by_source.csv`

**Original data sources:** ZenPower `records.csv` + installer CSVs (SolarCity, Sullivan, Titan, Sunrun, Freedom Forever)

| Field used | Source column | How it's used |
| --- | --- | --- |
| Year (dict key) | `year` | X-axis position; one frame per year |
| `solarcity` | `count` where `source = solarcity` | SolarCity install count for that year |
| `sullivan` | `count` where `source = sullivan` | Sullivan Solar install count |
| `titan` | `count` where `source = titan` | Titan Solar install count |
| `sunrun` | `count` where `source = sunrun` | Sunrun install count |
| `freedom_forever` | `count` where `source = freedom_forever` | Freedom Forever install count |
| `records` | `count` where `source = records` | ZenPower permit records install count |

> Monthly counts from `timeline_by_source.csv` are summed to yearly totals per source before being stored in `TIMELINE_BY_YEAR`.

---

## SavingsAtlas — National View (`src/components/solariq/SavingsAtlas.tsx`)

**What it shows:** A choropleth map of the US colored by per-capita annual solar savings, with a sidebar showing the top 10 states and a hover tooltip.

**Data modules:**
- `src/data/stateSavings.ts` → `STATE_SAVINGS_DATA: Record<stateAb, {ts, p, z, pc, c}>`

**Source file:** `data/output/national_savings_by_zip.csv` (aggregated to state level)

**Original data sources:** NREL Solar Resource API + EIA electricity rates + US Census population + ZenPower permits

| Field used | Derived from | How it's used |
| --- | --- | --- |
| State abbreviation (key) | `state` | Looks up state in `STATE_SAVINGS_DATA` |
| `pc` (per-capita savings $/yr) | `avg_annual_savings_usd` averaged / pop | Choropleth color scale; Top 10 ranking; tooltip |
| `ts` (total savings $) | `avg_annual_savings_usd` summed | Tooltip + sidebar stat; national total header |
| `p` (population) | `population` summed per state | Tooltip |
| `z` (ZIP count) | count of ZIPs per state | Tooltip |
| `c` (confidence level) | `irr_source` coverage → `HIGH`/`MEDIUM`/`LOW` | Hatch pattern overlay for LOW confidence states |

**Map geometry:** State outlines fetched at runtime from `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json` (TopoJSON). Not from `data/output/`.

---

## SavingsAtlas — State Drilldown View (`src/components/solariq/SavingsAtlas.tsx`)

**What it shows:** When a state is clicked, switches to a dot map of ZIP code centroids within that state, colored by annual savings potential.

**Data modules:**
- `src/data/zipData.ts` → `ZIP_DATA: Record<zip, {city, state, rate, kwh, offset, kw, tilt}>`
- `src/data/zipCentroids.ts` → `ZIP_CENTROIDS: Record<zip, [lat, lon]>`

**Source files:**
- `ZIP_DATA` ← `data/output/national_savings_by_zip.csv`
- `ZIP_CENTROIDS` ← [Kaggle ZIP GeoJSON dataset](https://www.kaggle.com/datasets/manishagarwal/us-zip-geojson-w-approx-zcta-census-data) (centroid lat/lon extracted per ZIP)

| Field used | Source column | How it's used |
| --- | --- | --- |
| `centroid` → `[lat, lon]` | ZIP_CENTROIDS | Dot position on map |
| `kwh × rate` → `savings` | `avg_annual_kwh × electricity_rate_per_kwh` | Dot color (green gradient); tooltip savings figure |
| `city` | `city` | Tooltip city label |
| `rate` | `electricity_rate_per_kwh` | Tooltip: rate $/kWh |
| `offset` | `avg_pct_consumption_offset` | Tooltip: bill offset % |
| `kw` | `avg_kw` | Tooltip: avg system size |

---

## SavingsCalculator (`src/components/solariq/SavingsCalculator.tsx`)

**What it shows:** An interactive calculator where the user enters a ZIP code and monthly electric bill; outputs estimated annual savings, bill offset, system size, and peak sun hours for that ZIP.

**Data modules:**
- `src/data/zipData.ts` → `ZIP_DATA`
- `src/data/zipCityFallback.ts` → `ZIP_CITY_FALLBACK: Record<zip, {city, state}>`

**Source files:**
- `ZIP_DATA` ← `data/output/national_savings_by_zip.csv`
- `ZIP_CITY_FALLBACK` ← USPS ZIP→city crosswalk (used when a ZIP has no entry in `ZIP_DATA`)

| Field used | Source column | How it's used |
| --- | --- | --- |
| `offset` | `avg_pct_consumption_offset` | `annual_savings = annual_spend × (offset / 100)` |
| `kw` | `avg_kw` | Displayed as "Avg System" stat |
| `tilt` | `tilt_annual` | Displayed as "Peak Sun Hrs" stat |
| `city`, `state` | `city`, `state` | Location label shown after ZIP lookup |
| `ZIP_CITY_FALLBACK` | USPS crosswalk | Fallback city/state label if ZIP is missing from `ZIP_DATA` |
