import { NextResponse } from "next/server";
import crypto from "crypto";
import { requireEditorOrAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Xác thực quyền Editor hoặc Admin
    await requireEditorOrAdmin();
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized access" },
      { status: 401 }
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "showroom";

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary credentials are not configured on the server" },
      { status: 500 }
    );
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Chuỗi cần ký (sắp xếp các tham số theo thứ tự alphabet)
  const paramsToSign = {
    folder,
    timestamp,
  };

  const stringToSign = Object.entries(paramsToSign)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, val]) => `${key}=${val}`)
    .join("&") + apiSecret;

  const signature = crypto
    .createHash("sha1")
    .update(stringToSign)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey,
    cloudName,
  });
}
