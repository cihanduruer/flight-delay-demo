import { NextRequest, NextResponse } from "next/server";
import { getDelayStats } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dayOfWeek = parseInt(searchParams.get("dayOfWeek") ?? "", 10);
  const airportId = parseInt(searchParams.get("airportId") ?? "", 10);

  if (isNaN(dayOfWeek) || isNaN(airportId)) {
    return NextResponse.json(
      { error: "dayOfWeek and airportId are required integer query params" },
      { status: 400 }
    );
  }

  const stats = getDelayStats(dayOfWeek, airportId);

  if (!stats) {
    return NextResponse.json(
      { error: "No data available for this combination" },
      { status: 404 }
    );
  }

  return NextResponse.json(stats);
}
