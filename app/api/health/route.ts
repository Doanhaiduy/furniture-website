import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Instantiate admin client to verify environment validation runs
    const supabase = createAdminClient();

    // Query profiles table with a limit of 1 to ping the database (bypasses RLS using service role)
    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Health check database ping failed:", error);
      return NextResponse.json(
        { status: "error", database: "disconnected", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Health check failed:", err);
    return NextResponse.json(
      { status: "error", database: "disconnected", error: errorMessage },
      { status: 500 }
    );
  }
}
