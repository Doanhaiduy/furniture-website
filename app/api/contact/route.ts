import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/validations/quote";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = quoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Invalid quote request.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.honeypot) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Invalid quote request.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    data: { submitted: true },
  });
}
