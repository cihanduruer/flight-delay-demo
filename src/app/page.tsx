"use client";

import * as React from "react";
import { AirportCombobox, AirportOption } from "@/components/airport-combobox";
import { DatePicker } from "@/components/date-picker";
import { DelayMap, NearbyData } from "@/components/delay-map";
import { PopularDestinations } from "@/components/popular-destinations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { WEEKDAY_NAMES, jsWeekdayToDataset } from "@/lib/constants";

interface DelayResult {
  probability: number;
  totalFlights: number;
  delayedFlights: number;
}

export default function HomePage() {
  const [airports, setAirports] = React.useState<AirportOption[]>([]);
  const [selectedAirport, setSelectedAirport] = React.useState<number | null>(
    null
  );
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [result, setResult] = React.useState<DelayResult | null>(null);
  const [noData, setNoData] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [nearbyData, setNearbyData] = React.useState<NearbyData | null>(null);

  // Load airport list once
  React.useEffect(() => {
    fetch("/api/airports")
      .then((r) => r.json())
      .then((data: AirportOption[]) => setAirports(data))
      .catch(() => {});
  }, []);

  // Fetch delay stats whenever both inputs are set
  React.useEffect(() => {
    if (selectedAirport == null || !selectedDate) {
      setResult(null);
      setNoData(false);
      setNearbyData(null);
      return;
    }

    const dayOfWeek = jsWeekdayToDataset(selectedDate.getDay());

    setLoading(true);
    setNoData(false);
    setResult(null);
    setNearbyData(null);

    // Fetch both delay stats and nearby airports in parallel
    Promise.all([
      fetch(
        `/api/delay?dayOfWeek=${dayOfWeek}&airportId=${selectedAirport}`
      ).then(async (r) => {
        if (r.status === 404) return null;
        return r.json() as Promise<DelayResult>;
      }),
      fetch(
        `/api/nearby?dayOfWeek=${dayOfWeek}&airportId=${selectedAirport}`
      ).then(async (r) => {
        if (!r.ok) return null;
        return r.json() as Promise<NearbyData>;
      }),
    ])
      .then(([delayData, nearby]) => {
        if (delayData) {
          setResult(delayData);
        } else {
          setNoData(true);
        }
        if (nearby) setNearbyData(nearby);
      })
      .catch(() => setNoData(true))
      .finally(() => setLoading(false));
  }, [selectedAirport, selectedDate]);

  const derivedWeekday = selectedDate
    ? WEEKDAY_NAMES[jsWeekdayToDataset(selectedDate.getDay())]
    : null;

  return (
    <main className="min-h-screen flex items-start justify-center p-8 bg-background">
      <div className="w-full max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Flight Delay Checker
          </h1>
          <p>
                 __|__
--@--@--(_)--@--@--  
          <p/>
          <p className="text-muted-foreground text-sm">
            See the chance your flight arrives ≥ 15 minutes late, based on 2013
            US flight data.
          </p>
        </div>

        {/* Popular destinations */}
        <PopularDestinations airports={airports} onSelect={setSelectedAirport} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: inputs + result */}
          <div className="space-y-4">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Arrival Airport</Label>
                <AirportCombobox
                  airports={airports}
                  value={selectedAirport}
                  onChange={setSelectedAirport}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker value={selectedDate} onChange={setSelectedDate} />
                {derivedWeekday && (
                  <p className="text-xs text-muted-foreground">
                    Day of week:{" "}
                    <span className="font-medium">{derivedWeekday}</span>
                  </p>
                )}
                {selectedDate && selectedDate.getFullYear() !== 2013 && (
                  <p className="text-xs text-amber-600">
                    Note: the dataset covers 2013 only. Results are based on
                    2013 {derivedWeekday} flights.
                  </p>
                )}
              </div>
            </div>

            {/* Result */}
            {loading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}

            {noData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    No data available
                  </CardTitle>
                  <CardDescription>
                    There are no recorded non-cancelled flights for this airport
                    on a {derivedWeekday ?? "the selected day"}.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Delay Probability
                  </CardTitle>
                  <CardDescription>
                    Chance of arriving ≥ 15 minutes late on a{" "}
                    {derivedWeekday ?? "selected day"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {(result.probability * 100).toFixed(1)}%
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Based on {result.totalFlights.toLocaleString()} flights (
                    {result.delayedFlights.toLocaleString()} delayed)
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: map */}
          <div className="space-y-2">
            {nearbyData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Nearby Airport Delays
                  </CardTitle>
                  <CardDescription>
                    Top 10 closest airports with delay data for{" "}
                    {derivedWeekday ?? "the selected day"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DelayMap data={nearbyData} selectedDelay={result} />
                </CardContent>
              </Card>
            )}

            {!nearbyData && selectedAirport != null && selectedDate && !loading && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Map</CardTitle>
                  <CardDescription>
                    No nearby airport data available for this combination.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {(selectedAirport == null || !selectedDate) && (
              <div className="flex items-center justify-center h-64 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Select an airport and date to see the delay map
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
