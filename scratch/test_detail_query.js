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

async function testQuery(slug, locale) {
  // Try 1: finding translation by slug
  const { data: transList, error: transError } = await supabase
    .from("product_translations")
    .select("product_id")
    .eq("slug", slug)
    .limit(1);

  console.log(`Querying translation for slug "${slug}":`);
  console.log("  transList:", transList);
  console.log("  transError:", transError);

  if (!transList || transList.length === 0) {
    console.log("No product_translations row found for slug:", slug);
    return;
  }

  const productId = transList[0].product_id;
  console.log("Found Product ID:", productId);

  // Try 2: fetching full product details
  const { data: row, error: rowError } = await supabase
    .from("products")
    .select(`
      id,
      reference_code,
      status,
      deleted_at,
      product_translations (locale, slug, name)
    `)
    .eq("id", productId)
    .is("deleted_at", null)
    .maybeSingle();

  console.log("Product Row query:");
  console.log("  row:", row);
  console.log("  rowError:", rowError);
}

async function run() {
  await testQuery("sofa-da-bo-y-3-cho", "vi");
  console.log("\n-------------------\n");
  await testQuery("ke-tivi-go-soi-nordic", "vi");
}

run();
