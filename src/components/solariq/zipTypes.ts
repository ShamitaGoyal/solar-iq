export type ZipRow = {
  city: string;
  state: string;
  rate: number;
  kwh: number;
  offset: number;
  kw: number;
  tilt: number;
};

export type ZipData = Record<string, ZipRow>;

// ZIP centroid tuple as stored in `ZIP_CENTROIDS` (lat, lon).
export type ZipCentroids = Record<string, [number, number]>;

