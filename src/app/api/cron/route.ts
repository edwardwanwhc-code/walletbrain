import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/**
 * Cron webhook endpoint for Hermes Agent to trigger promotion updates.
 * Protected by CRON_SECRET.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const supabase = getServiceClient();

    // Record the agent log
    const { error } = await supabase.from("agent_logs").insert({
      task_type: body.task_type || "promotion_update",
      status: body.status || "success",
      summary: body.summary || null,
      checked_count: body.checked_count || 0,
      added_count: body.added_count || 0,
      updated_count: body.updated_count || 0,
      expired_count: body.expired_count || 0,
      needs_review_count: body.needs_review_count || 0,
    });

    if (error) {
      console.error("Failed to create agent log:", error);
      return NextResponse.json(
        { error: "Failed to create agent log" },
        { status: 500 }
      );
    }

    // If promotions data is included, upsert it
    if (body.promotions && Array.isArray(body.promotions)) {
      for (const promo of body.promotions) {
        const { error: upsertError } = await supabase
          .from("promotions")
          .upsert(
            {
              ...promo,
              updated_at: new Date().toISOString(),
              last_checked_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (upsertError) {
          console.error(`Failed to upsert promotion ${promo.id}:`, upsertError);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cron webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
