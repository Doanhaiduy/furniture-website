const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const dotenvText = fs.readFileSync(".env", "utf8");
const env = {};
dotenvText.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[đĐ]/g, "d") // Replace special d/D characters
    .replace(/[^a-z0-9-]/g, "") // Remove all non-alphanumeric chars except -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-+|-+$/g, ""); // Trim - from start and end
}

async function fixProductTranslations() {
  console.log("Fixing product_translations slugs...");
  const { data: trans, error } = await supabase
    .from("product_translations")
    .select("product_id, locale, name, slug");

  if (error) {
    console.error("Error reading product_translations:", error);
    return;
  }

  for (const t of trans) {
    const expected = slugify(t.name);
    if (t.slug !== expected) {
      console.log(`Updating product_translations for ID: ${t.product_id} [${t.locale}]: "${t.slug}" -> "${expected}"`);
      const { error: updErr } = await supabase
        .from("product_translations")
        .update({ slug: expected })
        .eq("product_id", t.product_id)
        .eq("locale", t.locale);
      if (updErr) {
        console.error("  Error updating:", updErr);
      }
    }
  }
}

async function fixCategoryTranslations() {
  console.log("Fixing product_category_translations slugs...");
  const { data: trans, error } = await supabase
    .from("product_category_translations")
    .select("category_id, locale, name, slug");

  if (error) {
    console.error("Error reading product_category_translations:", error);
    return;
  }

  for (const t of trans) {
    const expected = slugify(t.name);
    if (t.slug !== expected) {
      console.log(`Updating product_category_translations for ID: ${t.category_id} [${t.locale}]: "${t.slug}" -> "${expected}"`);
      const { error: updErr } = await supabase
        .from("product_category_translations")
        .update({ slug: expected })
        .eq("category_id", t.category_id)
        .eq("locale", t.locale);
      if (updErr) {
        console.error("  Error updating:", updErr);
      }
    }
  }
}

async function fixBrandTranslations() {
  console.log("Fixing brand_translations slugs...");
  const { data: trans, error } = await supabase
    .from("brand_translations")
    .select("brand_id, locale, name, slug");

  if (error) {
    console.error("Error reading brand_translations (might not have slug):", error);
    return;
  }

  for (const t of trans) {
    const expected = slugify(t.name);
    if (t.slug !== expected) {
      console.log(`Updating brand_translations for ID: ${t.brand_id} [${t.locale}]: "${t.slug}" -> "${expected}"`);
      const { error: updErr } = await supabase
        .from("brand_translations")
        .update({ slug: expected })
        .eq("brand_id", t.brand_id)
        .eq("locale", t.locale);
      if (updErr) {
        console.error("  Error updating:", updErr);
      }
    }
  }
}

async function run() {
  await fixProductTranslations();
  console.log("\n-------------------\n");
  await fixCategoryTranslations();
  console.log("\n-------------------\n");
  await fixBrandTranslations();
  console.log("\nDone!");
}

run();
