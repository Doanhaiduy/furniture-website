import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminUsers } from "@/lib/supabase/admin-queries";
import { writeAuditLog } from "@/lib/supabase/audit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getAdminUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (err) {
    console.error("GET users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, fullName, role, isActive } = body;

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMock) {
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        email,
        full_name: fullName,
        role,
        is_active: isActive ?? true,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, data: mockUser });
    }

    const supabase = createAdminClient();

    // 1. Create user in Supabase Auth via Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError || !authData?.user) {
      console.error("Auth createUser error:", authError);
      return NextResponse.json({ error: authError?.message || "Failed to create auth user" }, { status: 400 });
    }

    const newUser = authData.user;

    // 2. Upsert profile record
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: newUser.id,
        email,
        full_name: fullName,
        role,
        is_active: isActive ?? true,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      // Clean up Auth user to prevent dangling auth record
      await supabase.auth.admin.deleteUser(newUser.id);
      return NextResponse.json({ error: profileError.message || "Failed to create user profile" }, { status: 400 });
    }

    // 3. Write audit log
    try {
      await writeAuditLog(supabase, {
        actorId: actor.id,
        action: "create",
        entityType: "profile",
        entityId: newUser.id,
        metadata: { email, role, full_name: fullName },
      });
    } catch (auditErr) {
      console.warn("Audit log failed for user creation, continuing anyway:", auditErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        email,
        full_name: fullName,
        role,
        is_active: isActive ?? true,
        created_at: newUser.created_at,
      },
    });
  } catch (err) {
    console.error("POST users error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, role, isActive } = body;

    if (!id || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (useMock) {
      return NextResponse.json({ success: true });
    }

    const supabase = createAdminClient();

    // 1. Cập nhật bảng profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return NextResponse.json({ error: profileError.message || "Failed to update profile" }, { status: 400 });
    }

    // 2. Ghi nhật ký audit log
    try {
      await writeAuditLog(supabase, {
        actorId: actor.id,
        action: "update",
        entityType: "profile",
        entityId: id,
        metadata: { role, is_active: isActive },
      });
    } catch (auditErr) {
      console.warn("Audit log failed for user update, continuing anyway:", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT users error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal server error" }, { status: 500 });
  }
}
