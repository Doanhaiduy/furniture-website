import { describe, expect, it } from "vitest";
import { parseProductFilters, productFiltersSchema } from "../../lib/validations/filters";

describe("productFiltersSchema and parseProductFilters", () => {
  it("should accept valid filters and parse them correctly", () => {
    const raw = {
      category: "wood",
      brand: "toto",
      q: "sofa",
      priceMin: "1000000",
      priceMax: "5000000",
      sort: "price-asc",
      page: "2",
      limit: "24",
    };

    const parsed = parseProductFilters(raw);
    expect(parsed.category).toBe("wood");
    expect(parsed.brand).toBe("toto");
    expect(parsed.q).toBe("sofa");
    expect(parsed.priceMin).toBe(1000000);
    expect(parsed.priceMax).toBe(5000000);
    expect(parsed.sort).toBe("price-asc");
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(24);
  });

  it("should fallback to defaults when validation fails", () => {
    const raw = {
      priceMin: "-100", // invalid min
      sort: "invalid-sort" as any, // invalid enum
      page: "0", // invalid min page
    };

    const parsed = parseProductFilters(raw);
    expect(parsed.sort).toBe("featured");
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(12);
  });

  it("should handle empty strings and array parameters", () => {
    const raw = {
      category: "",
      brand: ["toto", "inax"],
      q: "  test  ",
    };

    const parsed = parseProductFilters(raw);
    expect(parsed.category).toBeUndefined();
    expect(parsed.brand).toBe("toto"); // takes first element of array
    expect(parsed.q).toBe("test");
  });
});
