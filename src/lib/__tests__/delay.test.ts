import { describe, it, expect, beforeEach, vi } from "vitest";
import path from "path";
import type { DelayStats, Airport } from "../data";

/**
 * Tests for the delay-calculation feature.
 *
 * Fixture (flights.csv) contents summary — all rows target DestAirportID 20000
 * ("Alpha Airport") or 30000 ("Bravo Airport"):
 *
 * DayOfWeek 1, Dest 20000 (non-cancelled, valid ArrDel15):
 *   ArrDel15=0, ArrDel15=1, ArrDel15=1, ArrDel15=0  → 4 flights, 2 delayed → 0.5
 *
 * DayOfWeek 1, Dest 20000, Cancelled=1:
 *   Row 10 → must be excluded from calculation
 *
 * DayOfWeek 1, Dest 20000, ArrDel15 missing (empty):
 *   Row 11 → must be excluded (defensive parsing)
 *
 * DayOfWeek 2, Dest 20000:
 *   ArrDel15=0, ArrDel15=0 → 2 flights, 0 delayed → 0.0
 *
 * DayOfWeek 1, Dest 30000 ("Bravo Airport"):
 *   ArrDel15=0, ArrDel15=1 → 2 flights, 1 delayed → 0.5
 *
 * DayOfWeek 3, Dest 20000 → no rows → null
 */

// We need to point the module at our test fixture instead of the real CSV.
// The module uses process.cwd() + "data/flights.csv", so we mock the path
// by overriding process.cwd before each import and resetting the module cache.

function loadDataModule() {
  // Clear the module cache so each test suite gets a fresh import
  vi.resetModules();

  // Stub process.cwd to the fixtures directory parent so
  // path.join(process.cwd(), "data", "flights.csv") resolves to our fixture
  const fixtureDir = path.resolve(__dirname, "fixtures");
  // We'll create a "data" subfolder expectation: fixture is at fixtures/flights.csv
  // but the module expects data/flights.csv relative to cwd.
  // So cwd should be the parent of "data", and our fixture folder acts as "data".
  const fakeCwd = path.resolve(fixtureDir, "..");
  // We need fixtures/ renamed as data/ — instead, let's mock path.join for csvPath.
  // Simpler: just override process.cwd.
  // The module does: path.join(process.cwd(), "data", "flights.csv")
  // Our fixture is at: __tests__/fixtures/flights.csv
  // So we create a symlink or just override cwd so that <cwd>/data/flights.csv → fixture.

  // Easiest approach: mock process.cwd to return a path such that
  // path.join(result, "data", "flights.csv") === our fixture path.
  const fixtureCsvPath = path.resolve(fixtureDir, "flights.csv");
  // We need: path.join(cwd, "data", "flights.csv") === fixtureCsvPath
  // So cwd must be: fixtureCsvPath minus "/data/flights.csv"
  // But our fixture isn't in a "data" subfolder — it's in "fixtures".
  // Let's just mock the entire csvPath result via vi.mock.

  vi.doMock("path", async () => {
    const actual = await vi.importActual<typeof import("path")>("path");
    return {
      ...actual,
      default: {
        ...actual,
        join: (...args: string[]) => {
          // Intercept the specific call: join(cwd, "data", "flights.csv")
          if (
            args.length === 3 &&
            args[1] === "data" &&
            args[2] === "flights.csv"
          ) {
            return fixtureCsvPath;
          }
          return actual.join(...args);
        },
      },
      join: (...args: string[]) => {
        if (
          args.length === 3 &&
          args[1] === "data" &&
          args[2] === "flights.csv"
        ) {
          return fixtureCsvPath;
        }
        return actual.join(...args);
      },
    };
  });

  return import("../data");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getDelayStats", () => {
  let getDelayStats: (
    dayOfWeek: number,
    destAirportId: number
  ) => DelayStats | null;
  let getAirports: () => Airport[];

  beforeEach(async () => {
    const mod = await loadDataModule();
    getDelayStats = mod.getDelayStats;
    getAirports = mod.getAirports;
  });

  // ---- Core probability calculation ----

  it("returns correct probability for day 1, airport 20000 (50 %)", () => {
    const stats = getDelayStats(1, 20000);
    expect(stats).not.toBeNull();
    expect(stats!.totalFlights).toBe(4);
    expect(stats!.delayedFlights).toBe(2);
    expect(stats!.probability).toBeCloseTo(0.5);
  });

  it("returns 0 % probability when no flights are delayed (day 2, airport 20000)", () => {
    const stats = getDelayStats(2, 20000);
    expect(stats).not.toBeNull();
    expect(stats!.totalFlights).toBe(2);
    expect(stats!.delayedFlights).toBe(0);
    expect(stats!.probability).toBe(0);
  });

  it("returns correct stats for a different airport (day 1, airport 30000)", () => {
    const stats = getDelayStats(1, 30000);
    expect(stats).not.toBeNull();
    expect(stats!.totalFlights).toBe(2);
    expect(stats!.delayedFlights).toBe(1);
    expect(stats!.probability).toBeCloseTo(0.5);
  });

  // ---- Cancelled-flight exclusion (ADR-0002) ----

  it("excludes cancelled flights from the calculation", () => {
    // Row 10 is Cancelled=1 for day 1 / airport 20000.
    // If it were included, totalFlights would be 5 instead of 4.
    const stats = getDelayStats(1, 20000);
    expect(stats!.totalFlights).toBe(4);
  });

  // ---- Missing ArrDel15 handling ----

  it("excludes rows where ArrDel15 is missing or non-numeric", () => {
    // Row 11 has empty ArrDel15 for day 1 / airport 20000.
    // If included, totalFlights would be 5 (or more) instead of 4.
    const stats = getDelayStats(1, 20000);
    expect(stats!.totalFlights).toBe(4);
  });

  // ---- No-data combination ----

  it("returns null when no data exists for the combination", () => {
    const stats = getDelayStats(3, 20000);
    expect(stats).toBeNull();
  });

  it("returns null for a non-existent airport", () => {
    const stats = getDelayStats(1, 99999);
    expect(stats).toBeNull();
  });

  // ---- Probability is between 0 and 1 ----

  it("probability is always between 0 and 1", () => {
    const stats = getDelayStats(1, 20000);
    expect(stats!.probability).toBeGreaterThanOrEqual(0);
    expect(stats!.probability).toBeLessThanOrEqual(1);
  });
});

describe("getAirports", () => {
  let getAirports: () => Airport[];

  beforeEach(async () => {
    const mod = await loadDataModule();
    getAirports = mod.getAirports;
  });

  it("returns the correct set of airports from the fixture", () => {
    const airports = getAirports();
    const ids = airports.map((a) => a.id);
    expect(ids).toContain(20000);
    expect(ids).toContain(30000);
    // Only dest airports should appear — origin (10000) should not
    expect(ids).not.toContain(10000);
  });

  it("airports are sorted alphabetically by name", () => {
    const airports = getAirports();
    const names = airports.map((a) => a.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("airport objects contain required fields", () => {
    const airports = getAirports();
    for (const a of airports) {
      expect(a).toHaveProperty("id");
      expect(a).toHaveProperty("name");
      expect(a).toHaveProperty("city");
      expect(a).toHaveProperty("state");
    }
  });
});

describe("jsWeekdayToDataset", () => {
  // This is a pure function — no fixture needed
  let jsWeekdayToDataset: (jsDay: number) => number;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../constants");
    jsWeekdayToDataset = mod.jsWeekdayToDataset;
  });

  it("maps Sunday (JS 0) to dataset 7", () => {
    expect(jsWeekdayToDataset(0)).toBe(7);
  });

  it("maps Monday-Saturday (JS 1-6) to dataset 1-6", () => {
    for (let js = 1; js <= 6; js++) {
      expect(jsWeekdayToDataset(js)).toBe(js);
    }
  });
});
