import { NextResponse } from "next/server";
import { getAirports } from "@/lib/data";

export async function GET() {
  const airports = getAirports();
  return NextResponse.json(airports);
}
