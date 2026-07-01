import { createClient } from '@supabase/supabase-js';

async function test() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials in env");
    return;
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase.rpc("public_products", {
    p_locale: "vi",
    p_limit: 1
  });

  if (error) {
    console.error("Query Error:", error);
    return;
  }

  const { data: procData, error: procError } = await supabase.from("products").select("id").limit(1);
  console.log("Checking products count in DB:", procData?.length);

  // Let's run a raw sql query to print the function definition if we have pg, or inspect properties.
  // Since we can't run raw SQL easily via client API without a function, let's print the actual product row details from database using from("products").select("*").limit(1).
  const { data: dbBrands, error: brandError } = await supabase.from("brands").select("*").limit(1);

  if (brandError) {
    console.error("Query Error:", brandError);
    return;
  }

  console.log("KEYS IN brands TABLE:");
  if (dbBrands && dbBrands.length > 0) {
    console.log(Object.keys(dbBrands[0]));
    console.log("SAMPLE row:", dbBrands[0]);
  } else {
    console.log("No brands found.");
  }
}

test().catch(console.error);
