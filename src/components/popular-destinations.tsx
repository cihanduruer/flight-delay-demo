"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { BUSIEST_AIRPORTS } from "@/lib/constants";

// ---------- types ----------

interface AirportOption {
  id: number;
  name: string;
  city: string;
  state: string;
}

interface PopularDestinationsProps {
  airports: AirportOption[];
  onSelect: (airportId: number) => void;
}

// ---------- city image mapping ----------

/**
 * Curated Unsplash photos for major US cities in the dataset.
 * Key = city name (matching dataset DestCity). Uses small-size Unsplash CDN.
 */
const CITY_IMAGES: Record<string, string> = {
  "New York":
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
  "Los Angeles":
    "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=400&h=300&fit=crop",
  "Chicago":
    "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=400&h=300&fit=crop",
  "San Francisco":
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop",
  "Miami":
    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=400&h=300&fit=crop",
  "Las Vegas":
    "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400&h=300&fit=crop",
  "Seattle":
    "https://images.unsplash.com/photo-1502175353174-a7a70e73b4c3?w=400&h=300&fit=crop",
  "Boston":
    "https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=400&h=300&fit=crop",
  "Atlanta":
    "https://images.unsplash.com/photo-1575917649835-3896e4a3ad9c?w=400&h=300&fit=crop",
  "Denver":
    "https://images.unsplash.com/photo-1619856699906-09e1f4ef23c7?w=400&h=300&fit=crop",
  "Dallas/Fort Worth":
    "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=400&h=300&fit=crop",
  "Phoenix":
    "https://images.unsplash.com/photo-1558645836-e44122a743ee?w=400&h=300&fit=crop",
  "Orlando":
    "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?w=400&h=300&fit=crop",
  "Minneapolis":
    "https://images.unsplash.com/photo-1558376476-23da070e67d9?w=400&h=300&fit=crop",
  "Detroit":
    "https://images.unsplash.com/photo-1564598327082-68e017c40e38?w=400&h=300&fit=crop",
  "Philadelphia":
    "https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=400&h=300&fit=crop",
  "Houston":
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop",
  "Charlotte":
    "https://images.unsplash.com/photo-1577084381569-8c4a0db1e084?w=400&h=300&fit=crop",
  "Newark":
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop",
  "Fort Lauderdale":
    "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=400&h=300&fit=crop",
  "Tampa":
    "https://images.unsplash.com/photo-1605117882932-f9e15065e3ac?w=400&h=300&fit=crop",
  "Salt Lake City":
    "https://images.unsplash.com/photo-1617859047452-8510bcf207fd?w=400&h=300&fit=crop",
  "San Diego":
    "https://images.unsplash.com/photo-1538097304804-2a1b932466a9?w=400&h=300&fit=crop",
  "Portland":
    "https://images.unsplash.com/photo-1535627427734-68509a865a1e?w=400&h=300&fit=crop",
  "Nashville":
    "https://images.unsplash.com/photo-1587162146766-e06b1189b907?w=400&h=300&fit=crop",
  "New Orleans":
    "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=400&h=300&fit=crop",
  "Baltimore":
    "https://images.unsplash.com/photo-1572120360610-d971b9f30e7d?w=400&h=300&fit=crop",
  "Honolulu":
    "https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=400&h=300&fit=crop",
  "Anchorage":
    "https://images.unsplash.com/photo-1531176175280-109afb4e3ee3?w=400&h=300&fit=crop",
  "Raleigh/Durham":
    "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&h=300&fit=crop",
};

/** Fallback image for cities without a curated photo */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=300&fit=crop";

const DISPLAY_COUNT = 7;

// ---------- component ----------

export function PopularDestinations({
  airports,
  onSelect,
}: PopularDestinationsProps) {
  const [featured, setFeatured] = React.useState<AirportOption[]>([]);

  // Pick random airports on mount (stable across re-renders)
  React.useEffect(() => {
    if (airports.length === 0) return;

    // Prefer airports that have curated images
    const withImages = airports.filter((a) => a.city in CITY_IMAGES);
    const withoutImages = airports.filter((a) => !(a.city in CITY_IMAGES));

    // Shuffle both pools
    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const pool = [...shuffle(withImages), ...shuffle(withoutImages)];
    setFeatured(pool.slice(0, DISPLAY_COUNT));
  }, [airports]);

  if (featured.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        Popular flight destinations
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {featured.map((airport) => {
          const imageUrl = CITY_IMAGES[airport.city] ?? FALLBACK_IMAGE;
          return (
            <button
              key={airport.id}
              onClick={() => onSelect(airport.id)}
              className="group relative aspect-square overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Background image */}
              <img
                src={imageUrl}
                alt={airport.city}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* City label */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-sm font-semibold leading-tight">
                  {airport.city}
                </p>
                <p className="text-white/70 text-[10px] leading-tight truncate">
                  {airport.state}
                </p>
              </div>
              {/* Busiest airport badge */}
              {BUSIEST_AIRPORTS[airport.id] && (
                <div className="absolute top-1.5 right-1.5">
                  <Badge
                    variant={BUSIEST_AIRPORTS[airport.id].hub === "large" ? "default" : "secondary"}
                    className="text-[9px] px-1.5 py-0 gap-0.5"
                  >
                    ✈ #{BUSIEST_AIRPORTS[airport.id].rank}
                  </Badge>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
