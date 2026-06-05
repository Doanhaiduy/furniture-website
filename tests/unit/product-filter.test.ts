import { describe, expect, it } from "vitest";
import { filterProducts, paginateItems, sortProducts } from "../../lib/showroom-data";

describe("filterProducts", () => {
  it("filters by category", () => {
    const results = filterProducts({ category: "sanitary" });
    expect(results.every((product) => product.categoryKey === "sanitary")).toBe(true);
  });

  it("searches localized product names", () => {
    const results = filterProducts({ q: "sofa" });
    expect(results.map((product) => product.slug)).toContain("sofa-curve-velour");
  });

  it("excludes archived products from public results", () => {
    const results = filterProducts({});
    expect(results.map((product) => product.slug)).not.toContain("gach-marble-calacatta");
  });

  it("sorts featured products first when requested", () => {
    const results = sortProducts(filterProducts({}), "featured");
    expect(results[0]?.featured).toBe(true);
  });

  it("paginates catalog results with bounded page state", () => {
    const results = filterProducts({});
    const firstPage = paginateItems(results, 1, 3);
    const farPage = paginateItems(results, 99, 3);

    expect(firstPage.items).toHaveLength(3);
    expect(firstPage.totalPages).toBe(2);
    expect(farPage.currentPage).toBe(2);
  });
});
