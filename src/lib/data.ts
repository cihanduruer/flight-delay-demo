import fs from "fs";
import path from "path";

// ---------- types ----------

export interface Airport {
  id: number;
  name: string;
  city: string;
  state: string;
}

export interface AirportWithCoords extends Airport {
  lat: number;
  lon: number;
}

export interface DelayStats {
  probability: number; // 0-1
  totalFlights: number;
  delayedFlights: number;
}

export interface NearbyAirportDelay extends AirportWithCoords {
  delay: DelayStats;
}

// ---------- CSV parsing (lightweight, no external dep) ----------

function parseCSV(filePath: string): Record<string, string>[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = lines[0].split(",");
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

// ---------- singleton cache ----------

let _airports: Airport[] | null = null;
let _delayTable: Map<string, DelayStats> | null = null;

function csvPath() {
  return path.join(process.cwd(), "data", "flights.csv");
}

function buildCache() {
  if (_airports && _delayTable) return;

  const rows = parseCSV(csvPath());

  // airports: keyed by DestAirportID
  const airportMap = new Map<number, Airport>();
  // accumulator: key = "dayOfWeek-destAirportId"
  const acc = new Map<string, { total: number; delayed: number }>();

  for (const r of rows) {
    // Exclude cancelled flights (ADR-0002)
    if (r["Cancelled"] === "1") continue;

    const arrDel15 = r["ArrDel15"];
    // Skip rows where label is missing / non-numeric
    if (arrDel15 !== "0" && arrDel15 !== "1") continue;

    const destId = parseInt(r["DestAirportID"], 10);
    const dayOfWeek = parseInt(r["DayOfWeek"], 10);
    if (isNaN(destId) || isNaN(dayOfWeek)) continue;

    // Airport registry
    if (!airportMap.has(destId)) {
      airportMap.set(destId, {
        id: destId,
        name: r["DestAirportName"],
        city: r["DestCity"],
        state: r["DestState"],
      });
    }

    // Delay accumulator
    const key = `${dayOfWeek}-${destId}`;
    const entry = acc.get(key) ?? { total: 0, delayed: 0 };
    entry.total += 1;
    entry.delayed += arrDel15 === "1" ? 1 : 0;
    acc.set(key, entry);
  }

  // Sort airports alphabetically by name
  _airports = Array.from(airportMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  _delayTable = new Map<string, DelayStats>();
  for (const [key, v] of acc.entries()) {
    _delayTable.set(key, {
      probability: v.total > 0 ? v.delayed / v.total : 0,
      totalFlights: v.total,
      delayedFlights: v.delayed,
    });
  }
}

// ---------- public API ----------

export function getAirports(): Airport[] {
  buildCache();
  return _airports!;
}

export function getDelayStats(
  dayOfWeek: number,
  destAirportId: number
): DelayStats | null {
  buildCache();
  const key = `${dayOfWeek}-${destAirportId}`;
  return _delayTable!.get(key) ?? null;
}

// ---------- coordinates ----------

interface CoordEntry {
  lat: number;
  lon: number;
  iata: string;
}

let _coords: Map<number, CoordEntry> | null = null;

function loadCoords(): Map<number, CoordEntry> {
  if (_coords) return _coords;
  const coordPath = path.join(process.cwd(), "data", "airport-coordinates.json");
  const raw = JSON.parse(fs.readFileSync(coordPath, "utf-8")) as Record<
    string,
    CoordEntry
  >;
  _coords = new Map<number, CoordEntry>();
  for (const [id, entry] of Object.entries(raw)) {
    _coords.set(parseInt(id, 10), entry);
  }
  return _coords;
}

/**
 * Haversine distance in km between two lat/lon points.
 */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Get the coordinates of an airport by its ID.
 */
export function getAirportCoords(
  airportId: number
): AirportWithCoords | null {
  buildCache();
  const coords = loadCoords();
  const airport = _airports!.find((a) => a.id === airportId);
  const coord = coords.get(airportId);
  if (!airport || !coord) return null;
  return { ...airport, lat: coord.lat, lon: coord.lon };
}

/**
 * Return up to `limit` nearby airports (excluding the selected one) that have
 * delay data for the given dayOfWeek, sorted by distance from the target.
 */
export function getNearbyAirportDelays(
  airportId: number,
  dayOfWeek: number,
  limit = 10
): { selected: AirportWithCoords; nearby: NearbyAirportDelay[] } | null {
  buildCache();
  const coords = loadCoords();

  const selectedAirport = _airports!.find((a) => a.id === airportId);
  const selectedCoord = coords.get(airportId);
  if (!selectedAirport || !selectedCoord) return null;

  const selected: AirportWithCoords = {
    ...selectedAirport,
    lat: selectedCoord.lat,
    lon: selectedCoord.lon,
  };

  // Gather all other airports with delay data for this day
  const candidates: { airport: AirportWithCoords; delay: DelayStats; distance: number }[] = [];

  for (const airport of _airports!) {
    if (airport.id === airportId) continue;
    const coord = coords.get(airport.id);
    if (!coord) continue;

    const key = `${dayOfWeek}-${airport.id}`;
    const stats = _delayTable!.get(key);
    if (!stats) continue;

    const distance = haversineKm(
      selectedCoord.lat,
      selectedCoord.lon,
      coord.lat,
      coord.lon
    );

    candidates.push({
      airport: { ...airport, lat: coord.lat, lon: coord.lon },
      delay: stats,
      distance,
    });
  }

  // Sort by distance, take top N
  candidates.sort((a, b) => a.distance - b.distance);
  const nearby: NearbyAirportDelay[] = candidates
    .slice(0, limit)
    .map((c) => ({ ...c.airport, delay: c.delay }));

  return { selected, nearby };
}
