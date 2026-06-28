import { NextRequest, NextResponse } from "next/server";
import { recommend } from "@/lib/recommendation";
import type { RecommendationInput } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationInput = await request.json();

    // Validate input
    if (!body.amount_hkd || body.amount_hkd <= 0) {
      return NextResponse.json(
        { error: "Invalid amount_hkd" },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const result = await recommend({
      amount_hkd: body.amount_hkd,
      merchant: body.merchant || "",
      location: body.location || "",
      category: body.category,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
