import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock env from schema
vi.mock("@/lib/env/schema", () => ({
  env: {
    NEXT_PUBLIC_USE_MOCK_DATA: "false",
  },
  validateEnv: () => ({}),
}));

// Mock requireEditorOrAdmin
vi.mock("@/lib/supabase/auth", () => ({
  requireEditorOrAdmin: vi.fn().mockResolvedValue({ id: "mock-admin-id", email: "admin@furniture.com" }),
}));

// Mock Supabase DB Client calls
const mockCategories = [
  { id: "cat-1", parent_id: null },
  { id: "cat-2", parent_id: "cat-1" },
  { id: "cat-3", parent_id: "cat-2" }
];

const mockSelect = vi.fn().mockReturnThis();
const mockIs = vi.fn().mockResolvedValue({ data: mockCategories, error: null });
const mockUpdate = vi.fn().mockReturnThis();
const mockEq = vi.fn().mockReturnThis();
const mockSelectSingle = vi.fn().mockResolvedValue({ data: { id: "cat-3" }, error: null });
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockInsert = vi.fn().mockResolvedValue({ error: null });

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: mockSelect,
  is: mockIs,
  update: mockUpdate,
  eq: mockEq,
  single: mockSelectSingle,
  upsert: mockUpsert,
  insert: mockInsert,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockSupabase,
  createAdminClient: () => mockSupabase,
}));

import { updateAdminCategory } from "../../lib/supabase/mutations";

describe("Category Circular Reference Prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIs.mockResolvedValue({ data: mockCategories, error: null });
    mockSelectSingle.mockResolvedValue({ data: { id: "cat-3" }, error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  it("should prevent updating parent_id to itself", async () => {
    const result = await updateAdminCategory("cat-1", {
      slug: "go-tu-nhien",
      name_vi: "Gỗ tự nhiên",
      parent_id: "cat-1", // self
      group_key: "wood",
      status: "published",
      sort_order: 0,
      cover_image: null,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Circular parent-child relationship detected");
  });

  it("should prevent circular hierarchy: parent_id = descendant category", async () => {
    // Attempting to make cat-1 a child of cat-3 (its grandchild)
    const result = await updateAdminCategory("cat-1", {
      slug: "go-tu-nhien",
      name_vi: "Gỗ tự nhiên",
      parent_id: "cat-3", // descendant
      group_key: "wood",
      status: "published",
      sort_order: 0,
      cover_image: null,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Circular parent-child relationship detected");
  });

  it("should allow safe parent_id updates", async () => {
    // Move cat-3 directly under cat-1
    const result = await updateAdminCategory("cat-3", {
      slug: "sofa-go",
      name_vi: "Sofa gỗ",
      parent_id: "cat-1", // valid parent
      group_key: "wood",
      status: "published",
      sort_order: 2,
      cover_image: null,
    });

    console.log("TEST RESULT:", result);
    expect(result.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        parent_id: "cat-1",
      })
    );
  });
});
