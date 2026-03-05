/**
 * Centralized domain constants.
 * Do not duplicate weekday mappings or label definitions elsewhere.
 */

export const WEEKDAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

/**
 * Map JS Date.getDay() (0=Sun … 6=Sat) to the dataset's DayOfWeek (1=Mon … 7=Sun).
 */
export function jsWeekdayToDataset(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Busiest US airports by total passenger enplanements (FAA 2024 data).
 * Source: https://en.wikipedia.org/wiki/List_of_the_busiest_airports_in_the_United_States
 *
 * Key = DestAirportID from the dataset.
 * hub: "large" (≥1 % of US enplanements) | "medium" (0.25–1 %)
 * rank: overall rank (1 = busiest)
 */
export interface BusiestAirport {
  rank: number;
  hub: "large" | "medium";
}

export const BUSIEST_AIRPORTS: Record<number, BusiestAirport> = {
  // --- Large hubs (Top 31) ---
  10397: { rank: 1, hub: "large" },   // ATL – Atlanta
  11298: { rank: 2, hub: "large" },   // DFW – Dallas/Fort Worth
  11292: { rank: 3, hub: "large" },   // DEN – Denver
  13930: { rank: 4, hub: "large" },   // ORD – Chicago O'Hare
  12892: { rank: 5, hub: "large" },   // LAX – Los Angeles
  12478: { rank: 6, hub: "large" },   // JFK – New York JFK
  11057: { rank: 7, hub: "large" },   // CLT – Charlotte
  12889: { rank: 8, hub: "large" },   // LAS – Las Vegas
  13204: { rank: 9, hub: "large" },   // MCO – Orlando
  13303: { rank: 10, hub: "large" },  // MIA – Miami
  14107: { rank: 11, hub: "large" },  // PHX – Phoenix
  14747: { rank: 12, hub: "large" },  // SEA – Seattle
  14771: { rank: 13, hub: "large" },  // SFO – San Francisco
  11618: { rank: 14, hub: "large" },  // EWR – Newark
  12266: { rank: 15, hub: "large" },  // IAH – Houston Bush
  10721: { rank: 16, hub: "large" },  // BOS – Boston
  13487: { rank: 17, hub: "large" },  // MSP – Minneapolis
  11697: { rank: 18, hub: "large" },  // FLL – Fort Lauderdale
  12953: { rank: 19, hub: "large" },  // LGA – LaGuardia
  11433: { rank: 20, hub: "large" },  // DTW – Detroit
  14100: { rank: 21, hub: "large" },  // PHL – Philadelphia
  14869: { rank: 22, hub: "large" },  // SLC – Salt Lake City
  10821: { rank: 23, hub: "large" },  // BWI – Baltimore
  12264: { rank: 24, hub: "large" },  // IAD – Washington Dulles
  14679: { rank: 25, hub: "large" },  // SAN – San Diego
  11278: { rank: 26, hub: "large" },  // DCA – Reagan Washington
  15304: { rank: 27, hub: "large" },  // TPA – Tampa
  10693: { rank: 28, hub: "large" },  // BNA – Nashville
  10423: { rank: 29, hub: "large" },  // AUS – Austin
  12173: { rank: 30, hub: "large" },  // HNL – Honolulu
  13232: { rank: 31, hub: "large" },  // MDW – Chicago Midway

  // --- Medium hubs (32–63) ---
  11259: { rank: 32, hub: "medium" }, // DAL – Dallas Love Field
  14057: { rank: 33, hub: "medium" }, // PDX – Portland
  15016: { rank: 34, hub: "medium" }, // STL – St. Louis
  14492: { rank: 35, hub: "medium" }, // RDU – Raleigh-Durham
  12191: { rank: 36, hub: "medium" }, // HOU – Houston Hobby
  14893: { rank: 37, hub: "medium" }, // SMF – Sacramento
  13495: { rank: 38, hub: "medium" }, // MSY – New Orleans
  14843: { rank: 39, hub: "medium" }, // SJU – San Juan
  13198: { rank: 40, hub: "medium" }, // MCI – Kansas City
  14831: { rank: 41, hub: "medium" }, // SJC – San Jose
  14683: { rank: 42, hub: "medium" }, // SAT – San Antonio
  14635: { rank: 43, hub: "medium" }, // RSW – Fort Myers
  14908: { rank: 44, hub: "medium" }, // SNA – John Wayne / Santa Ana
  13796: { rank: 45, hub: "medium" }, // OAK – Oakland
  12339: { rank: 46, hub: "medium" }, // IND – Indianapolis
  11042: { rank: 47, hub: "medium" }, // CLE – Cleveland
  14122: { rank: 48, hub: "medium" }, // PIT – Pittsburgh
  11193: { rank: 49, hub: "medium" }, // CVG – Cincinnati
  11066: { rank: 50, hub: "medium" }, // CMH – Columbus
  14027: { rank: 51, hub: "medium" }, // PBI – Palm Beach
  12451: { rank: 52, hub: "medium" }, // JAX – Jacksonville
  13891: { rank: 53, hub: "medium" }, // ONT – Ontario
  13830: { rank: 54, hub: "medium" }, // OGG – Kahului
  10800: { rank: 55, hub: "medium" }, // BUR – Burbank
  10529: { rank: 56, hub: "medium" }, // BDL – Hartford / Bradley
  13342: { rank: 58, hub: "medium" }, // MKE – Milwaukee
  10299: { rank: 59, hub: "medium" }, // ANC – Anchorage
  10140: { rank: 60, hub: "medium" }, // ABQ – Albuquerque
  13871: { rank: 61, hub: "medium" }, // OMA – Omaha
  10792: { rank: 62, hub: "medium" }, // BUF – Buffalo
};

/**
 * Helper to get the busiest-airport info for a given airport ID.
 */
export function getBusiestInfo(airportId: number): BusiestAirport | null {
  return BUSIEST_AIRPORTS[airportId] ?? null;
}
