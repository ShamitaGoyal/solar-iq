All pipeline output files live in `data/output/`. The TypeScript data modules consumed by the site live in `src/data/`.

Pipeline constants used across outputs:

- `PEAK_SUN_HOURS = 4.5` (fallback if NREL irradiance missing)
- `PERSONS_PER_HOUSEHOLD = 2.53` (US Census 2020)
- `AVG_HOME_KWH_YEAR = 10,500` (US EIA avg residential annual consumption)
- System efficiency factor: **0.80**

---

## Scripts

### `scripts/simplify_zip_geo.py`

Simplifies state-level ZIP code GeoJSON files for efficient web delivery.

- **Input:** `data/state-zip-codes/<ab>_*_zip_codes_geo.min.json` (one file per state, from the [Kaggle ZIP GeoJSON dataset](https://www.kaggle.com/datasets/manishagarwal/us-zip-geojson-w-approx-zcta-census-data))
- **Output:** `public/zip-geo/<AB>.json` — one FeatureCollection per state with simplified ZIP polygons and a dissolved state boundary
- **Method:** Shapely `simplify(tolerance=0.008)` + `unary_union` for the state outline
- **Note:** Output is currently produced but not yet consumed by any site component. Built in anticipation of a polygon-based drilldown view.

---

## Output files used in the final site

### `city_savings_potential.csv` → `src/data/cityData.ts` → **CityRankings**

**Question:** Which cities have the most solar installs and total installed capacity?

**Grain:** One row per city-state pair (~672 cities)

**Source:** ZenPower permit records + installer CSVs (Sullivan, Titan, Sunrun, Freedom Forever)

| Column | Type | Description |
| --- | --- | --- |
| `city` | string | City name |
| `state` | string | 2-letter state abbreviation |
| `install_count` | int | Current solar permits observed in this city |
| `total_kw_installed` | float | Total installed capacity (kW) across all permits |

> Columns present in the CSV but not consumed by the site: `avg_kw_per_install`, `population`, `households`, `ghi_annual`, `dni_annual`, `tilt_annual`, `electricity_rate_per_kwh`, `current_annual_gen_kwh`, `current_annual_savings_usd`, `solar_adoption_rate_pct`, `full_adoption_kw`, `full_adoption_annual_kwh`, `full_adoption_savings_usd`, `additional_savings_possible`.

---

### `seasonality.csv` → `src/data/seasonalityData.ts` → **Seasonality**

**Question:** Which months of the year see the most solar installations?

**Grain:** One row per month-of-year (12 rows)

**Source:** `records.csv` + all installer CSVs, aggregated by calendar month across all years

| Column | Type | Description |
| --- | --- | --- |
| `month` | int | Month number (1–12) |
| `month_name` | string | 3-letter abbreviation (Jan–Dec) → mapped to `name` in TS |
| `total_installs` | int | Total installs in that month across all years → mapped to `installs` in TS |

---

### `national_savings_by_zip.csv` → `src/data/zipData.ts` + `src/data/stateSavings.ts` → **SavingsAtlas**, **SavingsCalculator**

**Question:** What is the solar savings potential for every ZIP code in the country?

**Grain:** One row per ZIP code (~39,493 ZIPs nationally)

**Sources:** USPS ZIP→state crosswalk + [NREL Solar Resource API](https://developer.nrel.gov/docs/solar/solar-resource-v1/) (irradiance) + ZenPower permit records + [EIA Annual Electric Power Industry Report](https://www.eia.gov/electricity/data/eia861/) (electricity rates) + [US Census population data](https://data.census.gov/table?t=Counts,+Estimates,+and+Projections:Population+Total&g=010XX00US$8600000)

**Note:** All savings figures are **annual** ($/yr).

| Column | Type | Site field | Description |
| --- | --- | --- | --- |
| `zipcode` | string (5-digit) | key | ZIP code (dict key in `ZIP_DATA`) |
| `city` | string | `city` | USPS default city for this ZIP |
| `state` | string | `state` | 2-letter state abbreviation |
| `electricity_rate_per_kwh` | float | `rate` | State-level retail electricity rate ($/kWh) from EIA |
| `avg_annual_kwh` | float | `kwh` | Estimated annual generation: `avg_kw × tilt_annual × 365 × 0.80` |
| `avg_pct_consumption_offset` | float | `offset` | % of avg US home consumption (10,500 kWh/yr) offset (capped at 100%) |
| `avg_kw` | float | `kw` | System size used for estimate (kW DC) |
| `tilt_annual` | float | `tilt` | Annual avg irradiance at optimal tilt (kWh/m²/day) — used as peak-sun-hours proxy |

> `stateSavings.ts` is a further aggregation of this file rolled up to state level. Fields: `ts` (total savings $), `p` (population), `z` (ZIP count), `pc` (per-capita savings $/yr), `c` (confidence: `HIGH`/`MEDIUM`/`LOW` based on NREL coverage).

> Columns present in the CSV but not consumed: `population`, `ghi_annual`, `dni_annual`, `irr_source`, `install_count`, `kw_source`.

---

### `timeline_by_source.csv` → `src/data/timelineData.ts` → **LineRace**


**Question:** How has solar adoption grown year-over-year, broken out by installer?

**Grain:** One row per (year_month, source) pair (~926 rows), pivoted to year-keyed dict in TS

**Source:** ZenPower permit records + all installer CSVs (SolarCity, Sullivan, Titan, Sunrun, Freedom Forever)

| Column | Type | Description |
| --- | --- | --- |
| `year_month` | string (YYYY-MM) | Month period |
| `year` | int | Calendar year (used as dict key in TS) |
| `month` | int | Month number |
| `source` | string | Installer name: `solarcity`, `sunrun`, `sullivan`, `titan`, `freedom_forever`, `records` |
| `count` | int | Number of installs from that source in that month |

> The TS module pivots this into `TIMELINE_BY_YEAR: Record<year, Record<source, count>>`, summing monthly counts per year per source.

---

### `state_electricity_rates.csv` — pipeline input only

**Supporting table** — not consumed directly by the site; used by the Q7 pipeline to attach per-state rates to every ZIP.

**Grain:** One row per US state (51 rows including DC)

**Source:** [EIA Annual Electric Power Industry Report](https://www.eia.gov/electricity/data/eia861/) — residential revenue and sales data

| Column | Type | Description |
| --- | --- | --- |
| `state` | string | 2-letter state abbreviation |
| `res_revenue_kd` | float | Residential revenue (thousands of dollars) |
| `res_sales_mwh` | float | Residential electricity sales (MWh) |
| `res_customers` | float | Number of residential customers |
| `rate_per_kwh` | float | Derived retail rate: `res_revenue_kd × 1000 / (res_sales_mwh × 1000)` ($/kWh) |

---

## Output files NOT used in the final site

The following files were produced during analysis but are not consumed by any site component:

| File | Description | Why not used |
| --- | --- | --- |
| `personal_savings_by_zip.csv` | Per-ZIP savings for surveyed ZIPs (~1,034) | Superseded by `national_savings_by_zip.csv` which covers all ~39k ZIPs |
| `solar_hotspots_by_zip.csv` | Solar adoption density by ZIP | Hotspot map not implemented |
| `monthly_trends.csv` | Monthly install trend line | Only seasonality and yearly breakdowns are shown |
| `yearly_trends.csv` | Year-over-year totals | LineRace uses per-source breakdown; aggregate not displayed |
| `permit_speed_by_city.csv` | Permit processing time by city | Visualization not implemented |
| `timeline_total.csv` | Monthly totals across all sources | LineRace uses per-source data; aggregate total not displayed |
| `zipcode_state_crosswalk.csv` | USPS ZIP→state mapping | Pipeline input only; not in `src/data/` |
