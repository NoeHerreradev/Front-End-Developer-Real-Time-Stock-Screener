import { NextResponse } from "next/server";
import { getStockUniverse } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const universe = getStockUniverse();
    return NextResponse.json({
      success: true,
      count: universe.length,
      timestamp: Date.now(),
      data: universe,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load stock universe",
      },
      { status: 500 }
    );
  }
}
