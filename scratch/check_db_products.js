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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      status,
      deleted_at,
      product_translations (locale, slug, name)
    `);

  if (error) {
    console.error("Error fetching products:", error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products:`);
  products.forEach(p => {
    console.log(`Product ID: ${p.id}, Status: ${p.status}, Deleted: ${p.deleted_at}`);
    const trans = p.product_translations || [];
    trans.forEach(t => {
      console.log(`  - [${t.locale}] Name: "${t.name}", Slug: "${t.slug}"`);
    });
  });
}

run();
