/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type Locale, isLocale } from "@/i18n/routing";

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import {
  imageAssets,
  localized,
  productGroups,
  productTaxonomy,
  sortProducts,
  filterProducts,
  paginateItems,
  type ProductSort,
  withLocale,
} from "@/lib/showroom-constants";
import { RemoteImage } from "@/components/showroom/remote-image";
import { ProductCard } from "@/components/showroom/product-card";
import { ProductFilterPanel } from "@/components/showroom/product-filter-panel";
import { ProductSortSelect } from "@/components/showroom/product-sort-select";
import { createPublicClient } from "@/lib/supabase/server";
import { getProducts, getCategories, mapDBProductGroupKeyToUI, mapDBProductToPublicProduct } from "@/lib/supabase/queries";
import { getPublicBrands } from "@/lib/supabase/brands-mutations";

type ProductSearchParams = {
  category?: string;
  material?: string;
  room?: string;
  style?: string;
  collection?: string;
  tone?: string;
  availability?: string;
  featured?: string;
  q?: string;
  page?: string;
  sort?: string;
  brand?: string;
};

const productPageSize = 8;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("productsTitle"),
    description: t("homeDescription"),
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<ProductSearchParams>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("products");
  const common = await getTranslations("common");

  // Fetch dynamic catalog data from database
  const supabase = createPublicClient();
  
  // Extract and build database filters
  const attributeFilters: Record<string, string> = {};
  const attrKeys = ["material", "room", "style", "collection", "tone", "availability"];
  attrKeys.forEach((key) => {
    const value = query[key as keyof ProductSearchParams];
    if (typeof value === "string" && value && value !== "all") {
      attributeFilters[key] = value;
    }
  });

  const getLocalizedValue = (val: any, loc: string) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") return val[loc] || val.vi || val.en || "";
    return String(val);
  };

  // Load categories and brands from database
  const dbCategories = await getCategories(supabase, locale);
  const brandsRes = await getPublicBrands();
  const publicBrands = (brandsRes.success && brandsRes.data) ? brandsRes.data : [];

  let brandId = typeof query.brand === "string" && query.brand !== "all" ? query.brand : undefined;

  // Resolve brand slug or name to database UUID if it is not already a UUID
  if (brandId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId)) {
    const searchStr = brandId.toLowerCase();
    const matchedBrand = publicBrands.find(
      (b: any) =>
        b.id === brandId ||
        b.name?.en?.toLowerCase() === searchStr ||
        b.name?.vi?.toLowerCase() === searchStr
    );
    if (matchedBrand) {
      brandId = matchedBrand.id;
    }
  }

  // Normalize query.brand to the resolved UUID so that option selection works
  if (brandId) {
    query.brand = brandId;
  }

  const categorySlug = typeof query.category === "string" && query.category !== "all" ? query.category : undefined;
  const q = typeof query.q === "string" && query.q ? query.q : undefined;
  const featured = query.featured === "true" ? true : undefined;

  // For products query, if category is "other", we fetch all products and exclude top 3 categories in JS
  let productsCategorySlug = categorySlug === "other" ? undefined : categorySlug;
  let productsGroupKey: string | undefined = undefined;

  if (productsCategorySlug === "wood") {
    productsGroupKey = "wooden_furniture";
    productsCategorySlug = undefined;
  } else if (productsCategorySlug === "sanitary") {
    productsGroupKey = "sanitary_equipment";
    productsCategorySlug = undefined;
  } else if (productsCategorySlug === "tiles") {
    productsGroupKey = "tiles";
    productsCategorySlug = undefined;
  }

  const dbProducts = await getProducts(supabase, {
    locale,
    categorySlug: productsCategorySlug,
    groupKey: productsGroupKey,
    q,
    featured,
    attributeFilters,
    brandId,
    limit: 1000,
  });
  const dbProductsMapped = dbProducts.map((p: any) => mapDBProductToPublicProduct(p, locale));

  // If category is "other", filter products to exclude top 3 root categories
  let categoryFilteredProducts = dbProductsMapped;
  let top3CatIds: string[] = [];

  const rootCats = dbCategories.filter((cat: any) => !cat.parentId);
  const rootCatCounts = rootCats.map((root: any) => {
    const children = dbCategories.filter((cat: any) => cat.parentId === root.id);
    const allCatIds = [root.id, ...children.map((c: any) => c.id)];
    const count = dbProductsMapped.filter((p: any) => allCatIds.includes(p.category_id) || allCatIds.includes(p.categoryId)).length;
    return { root, allCatIds, count };
  });
  const sortedRoots = [...rootCatCounts].sort((a, b) => b.count - a.count);
  const top3Roots = sortedRoots.slice(0, 3);
  top3CatIds = top3Roots.flatMap((item) => item.allCatIds);

  if (categorySlug === "other") {
    categoryFilteredProducts = dbProductsMapped.filter((p: any) => {
      const orig = dbProducts.find((dp: any) => dp.slug === p.slug);
      const categoryId = orig?.category_id || orig?.categoryId;
      return categoryId && !top3CatIds.includes(categoryId);
    });
  }

  // Bypass double filtering for category & brand since they are already filtered correctly
  const filterQuery = { ...query };
  delete filterQuery.category;
  delete filterQuery.brand;

  const filteredResults = filterProducts(filterQuery, categoryFilteredProducts);
  const sort: ProductSort = query.sort === "featured" ? "featured" : "newest";
  const results = sortProducts(filteredResults, sort);
  const requestedPage = Number.parseInt(query.page ?? "1", 10);
  const page = paginateItems(results, Number.isFinite(requestedPage) ? requestedPage : 1, productPageSize);

  const optionLabel = (value: { vi: string; en: string }) => localized(value, locale);
  const allOption = { value: "all", label: t("all") };
  
  const categoryOptions = [
    allOption,
    ...(dbCategories.length > 0 
      ? [
          ...dbCategories.map((cat: any) => ({
            value: cat.slug,
            label: cat.name,
          })),
          { value: "other", label: locale === "vi" ? "Thiết kế khác" : "Other designs" }
        ]
      : productGroups.slice(0, 3).map((group) => ({
          value: group.key,
          label: localized(group.title, locale),
        }))),
  ];

  const brandOptions = [
    { value: "all", label: locale === "vi" ? "Tất cả thương hiệu" : "All brands" },
    ...publicBrands.map((b: any) => ({
      value: b.id,
      label: getLocalizedValue(b.name, locale),
    })),
  ];

  const materialOptions = [
    allOption,
    ...productTaxonomy.materials.map((item) => ({ value: item.value, label: optionLabel(item.label) })),
  ];
  const roomOptions = [allOption, ...productTaxonomy.rooms.map((item) => ({ value: item.value, label: optionLabel(item.label) }))];
  const styleOptions = [allOption, ...productTaxonomy.styles.map((item) => ({ value: item.value, label: optionLabel(item.label) }))];
  const collectionOptions = [allOption, ...productTaxonomy.collections.map((item) => ({ value: item.value, label: optionLabel(item.label) }))];
  const toneOptions = [allOption, ...productTaxonomy.tones.map((item) => ({ value: item.value, label: optionLabel(item.label) }))];
  const availabilityOptions = [allOption, ...productTaxonomy.availability.map((item) => ({ value: item.value, label: optionLabel(item.label) }))];
  const featuredOptions = [
    allOption,
    { value: "true", label: t("featuredOnly") },
  ];
  const sortOptions = [
    { value: "newest", label: t("newest") },
    { value: "featured", label: t("featuredOnly") },
  ];
  const activeFilterSources: Array<[string, string | undefined, Array<{ value: string; label: string }>]> = [
    ["category", query.category, categoryOptions],
    ["brand", query.brand, brandOptions],
    ["material", query.material, materialOptions],
    ["room", query.room, roomOptions],
    ["style", query.style, styleOptions],
    ["collection", query.collection, collectionOptions],
    ["tone", query.tone, toneOptions],
    ["availability", query.availability, availabilityOptions],
    ["featured", query.featured, featuredOptions],
  ];
  const activeFilters = activeFilterSources
    .map(([key, value, options]) => {
      const label = options.find((option) => option.value === value)?.label;
      return typeof value === "string" && value !== "all" && label
        ? { key: key as string, label }
        : null;
    })
    .filter(Boolean) as Array<{ key: string; label: string }>;
  const advancedFilterActive = ["room", "style", "collection", "tone", "availability", "featured"].some((key) => {
    const value = query[key as keyof ProductSearchParams];
    return typeof value === "string" && value !== "all";
  });
  const makeProductHref = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === "string" && value && value !== "all") params.set(key, value);
    });

    Object.entries(overrides).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all" || (key === "page" && Number(value) <= 1) || (key === "sort" && value === "newest")) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    return withLocale(locale, `/products${queryString ? `?${queryString}` : ""}`);
  };
  const activeCategory = typeof query.category === "string" && query.category !== "all" ? query.category : undefined;
  const secondaryGroups = productGroups.filter((group) => group.key !== activeCategory);

  return (
    <main>
      <section className="container-pd public-page-header grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm text-secondary">{t("breadcrumb")}</p>
          <h1 className="type-page-title mt-6 text-primary">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-secondary">{t("lead")}</p>
        </div>
        <div className="public-image-panel relative">
          <RemoteImage src={imageAssets.woodWall} alt={t("title")} className="h-72 w-full object-cover lg:h-80" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </section>

      <section className="container-pd pb-20">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {productGroups.slice(0, 3).map((group) => (
            <Link
              key={group.key}
              href={withLocale(locale, group.href)}
              className="interactive-card surface-card group grid grid-cols-[92px_1fr] gap-4 p-3"
            >
              <RemoteImage src={group.image} alt={localized(group.title, locale)} className="public-media-thumb h-24 w-full object-cover" sizes="92px" />
              <span className="self-center">
                <span className="type-card-title text-xl text-primary">{localized(group.title, locale)}</span>
                <span className="mt-1 block text-sm leading-6 text-secondary">{localized(group.summary, locale)}</span>
              </span>
            </Link>
          ))}
        </div>

        <ProductFilterPanel
          labels={{
            filters: t("filters"),
            showing: t("showing", { count: results.length }),
            search: t("search"),
            category: t("category"),
            material: t("material"),
            room: t("room"),
            style: t("style"),
            collection: t("collection"),
            tone: t("tone"),
            availability: t("availability"),
            featuredOnly: t("featuredOnly"),
            apply: t("mobileFilters"),
            reset: common("reset"),
            expand: t("showMoreFilters"),
            collapse: t("collapseFilters"),
          }}
          query={query}
          options={{
            category: categoryOptions,
            material: materialOptions,
            room: roomOptions,
            style: styleOptions,
            collection: collectionOptions,
            tone: toneOptions,
            availability: availabilityOptions,
            featured: featuredOptions,
            brand: brandOptions,
          }}
          resetHref={withLocale(locale, "/products")}
          defaultExpanded={advancedFilterActive}
        />

        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-outline-variant/35 pb-5 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-secondary">{t("showing", { count: results.length })}</p>
            {activeFilters.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <span key={filter.key} className="filter-chip text-primary">
                    {filter.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="w-full md:w-56">
            <ProductSortSelect
              value={sort}
              options={sortOptions}
              placeholder={t("sort")}
              ariaLabel={t("sort")}
            />
          </div>
        </div>

          {results.length > 0 ? (
            <>
            <div className="motion-stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {page.items.map((product) => (
                <ProductCard key={product.slug} product={product} locale={locale} detailsLabel={common("explore")} density="catalog" />
              ))}
            </div>
            <nav className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/35 pt-6 md:flex-row" aria-label={t("pagination")}>
              <p className="text-sm font-semibold text-secondary">
                {t("pageStatus", { page: page.currentPage, total: page.totalPages })}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  aria-disabled={page.currentPage === 1}
                  tabIndex={page.currentPage === 1 ? -1 : undefined}
                  href={page.currentPage === 1 ? makeProductHref({ page: page.currentPage }) : makeProductHref({ page: page.currentPage - 1 })}
                  className="button-pd-outline public-pagination-control min-w-11 px-3"
                >
                  <ArrowLeft className="size-4" />
                  {t("previousPage")}
                </Link>
                {Array.from({ length: page.totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={makeProductHref({ page: pageNumber })}
                    aria-current={page.currentPage === pageNumber ? "page" : undefined}
                    className="public-pagination-link"
                  >
                    {pageNumber}
                  </Link>
                ))}
                <Link
                  aria-disabled={page.currentPage === page.totalPages}
                  tabIndex={page.currentPage === page.totalPages ? -1 : undefined}
                  href={page.currentPage === page.totalPages ? makeProductHref({ page: page.currentPage }) : makeProductHref({ page: page.currentPage + 1 })}
                  className="button-pd-outline public-pagination-control min-w-11 px-3"
                >
                  {t("nextPage")}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </nav>
            </>
          ) : (
            <div className="card-pd state-card grid min-h-80 place-items-center p-8 text-center">
              <div>
                <h2 className="type-section-title text-primary">
                  {common("emptyTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-secondary">
                  {common("emptyDescription")}
                </p>
                <Link href={withLocale(locale, "/contact")} className="button-pd mt-6">
                  {t("quoteNow")}
                </Link>
              </div>
            </div>
          )}
      </section>

      <section className="bg-surface-container-low py-16">
        <div className="container-pd">
          <div className="mb-7 max-w-2xl">
            <p className="label-pd">{t("otherCategories")}</p>
            <h2 className="type-section-title mt-3 text-primary">{t("taxonomyTitle")}</h2>
            <p className="mt-3 text-sm leading-6 text-secondary">{t("otherCategoriesLead")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {secondaryGroups.map((group) => {
              const count = filterProducts({ category: group.key }, dbProductsMapped).length;
              return (
              <Link
                key={group.key}
                href={withLocale(locale, group.href)}
                className="interactive-card surface-card group grid min-h-52 overflow-hidden"
              >
                <span className="relative h-28 overflow-hidden">
                  <RemoteImage src={group.image} alt={localized(group.title, locale)} className="image-lift h-full w-full object-cover" sizes="(min-width: 1280px) 25vw, 50vw" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                </span>
                <span className="grid gap-2 p-4">
                  <span className="type-card-title text-xl text-primary">{localized(group.title, locale)}</span>
                  <span className="text-sm leading-6 text-secondary">{localized(group.summary, locale)}</span>
                  <span className="mt-1 inline-flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.12em] text-outline">
                    {t("productsCount", { count })}
                    <ArrowRight className="size-4 text-primary transition group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
