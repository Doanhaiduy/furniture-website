import { describe, expect, it } from "vitest";
import {
  mapDBProductGroupKeyToUI,
  mapDBProductToPublicProduct,
} from "../../lib/supabase/queries";

describe("public product mapper", () => {
  it("maps database product group keys to public filter keys", () => {
    expect(mapDBProductGroupKeyToUI("wooden_furniture")).toBe("wood");
    expect(mapDBProductGroupKeyToUI("sanitary_equipment")).toBe("sanitary");
    expect(mapDBProductGroupKeyToUI("tiles")).toBe("tiles");
  });

  it("preserves RPC product fields used by listing cards and detail links", () => {
    const product = mapDBProductToPublicProduct(
      {
        slug: "san-pham-demo-local",
        reference_code: "LOCAL-DEMO-001",
        group_key: "wooden_furniture",
        category_name: "Do go noi that",
        name: "San pham demo local",
        summary: "San pham mau",
        price_display_text: "Lien he bao gia",
        dimension_display_text: "Tuy chon theo cong trinh",
        primary_media: { url: "https://res.cloudinary.com/demo/image/upload/sample.jpg" },
        media: [{ url: "https://res.cloudinary.com/demo/image/upload/sample.jpg" }],
        featured: true,
      },
      "vi",
    );

    expect(product.slug).toBe("san-pham-demo-local");
    expect(product.referenceCode).toBe("LOCAL-DEMO-001");
    expect(product.categoryKey).toBe("wood");
    expect(product.image).toContain("res.cloudinary.com");
    expect(product.price.vi).toBe("Lien he bao gia");
  });

  it("preserves normalized detail product fields", () => {
    const product = mapDBProductToPublicProduct(
      {
        slug: "local-demo-product",
        referenceCode: "LOCAL-DEMO-001",
        category: {
          groupKey: "sanitary_equipment",
          name: "Sanitary equipment",
        },
        name: "Local demo product",
        summary: "Sample product",
        priceDisplayText: "Contact for quote",
        dimensionDisplayText: "Custom by project",
        primaryMedia: { url: "https://res.cloudinary.com/demo/image/upload/detail.jpg" },
        media: [{ url: "https://res.cloudinary.com/demo/image/upload/detail.jpg" }],
      },
      "en",
    );

    expect(product.referenceCode).toBe("LOCAL-DEMO-001");
    expect(product.categoryKey).toBe("sanitary");
    expect(product.category.en).toBe("Sanitary equipment");
    expect(product.image).toContain("detail.jpg");
    expect(product.specs.map((spec) => spec.value.en)).toContain("Custom by project");
  });
});
