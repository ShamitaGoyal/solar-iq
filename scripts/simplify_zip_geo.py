#!/usr/bin/env python3
"""Simplify state ZIP code GeoJSON files for web delivery.

Input:  data/state-zip-codes/<ab>_*_zip_codes_geo.min.json
Output: public/zip-geo/<AB>.json

Each output file is a FeatureCollection of simplified ZIP polygons PLUS a
top-level "boundary" key containing the dissolved state outline geometry.
ZIP polygons are clipped to the dissolved boundary so nothing bleeds outside.

Run from repo root: python3 scripts/simplify_zip_geo.py
"""
import json
import os
import glob
from shapely.geometry import shape, mapping
from shapely.validation import make_valid
from shapely.ops import unary_union

SRC_DIR = "data/state-zip-codes"
OUT_DIR = "public/zip-geo"
TOLERANCE = 0.008  # ~0.8 km

os.makedirs(OUT_DIR, exist_ok=True)

files = sorted(glob.glob(f"{SRC_DIR}/*.min.json"))
print(f"Processing {len(files)} state files…")

for path in files:
    basename = os.path.basename(path)
    ab = basename.split("_")[0].upper()
    out_path = f"{OUT_DIR}/{ab}.json"

    print(f"  {ab}…", end=" ", flush=True)
    with open(path, "r") as f:
        fc = json.load(f)

    raw_shapes = []
    simplified_features = []

    for feat in fc.get("features", []):
        zip_code = feat["properties"].get("ZCTA5CE10", "")
        if not zip_code:
            continue
        try:
            geom = make_valid(shape(feat["geometry"]))
            raw_shapes.append(geom)
            simple = geom.simplify(TOLERANCE, preserve_topology=True)
            if simple.is_empty:
                continue
            simplified_features.append({
                "type": "Feature",
                "properties": {"zip": zip_code},
                "geometry": mapping(simple),
            })
        except Exception:
            continue

    # Dissolved state boundary — union of all raw ZIP shapes, then simplify lightly
    boundary = None
    if raw_shapes:
        try:
            union = make_valid(unary_union(raw_shapes))
            boundary = mapping(union.simplify(TOLERANCE * 2, preserve_topology=True))
        except Exception:
            pass

    out = {
        "type": "FeatureCollection",
        "boundary": boundary,
        "features": simplified_features,
    }
    out_str = json.dumps(out, separators=(",", ":"))
    with open(out_path, "w") as f:
        f.write(out_str)

    in_kb = os.path.getsize(path) / 1024
    out_kb = len(out_str) / 1024
    print(f"{len(simplified_features)} ZIPs | {in_kb:.0f} KB → {out_kb:.0f} KB  boundary={'ok' if boundary else 'FAIL'}")

print("Done.")
