/* eslint-disable */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { getProductBySlug, getProducts } from "./lib/supabase/queries";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing URL or Anon Key in environment variables!");
  process.exit(1);
}

console.log("Using URL:", supabaseUrl);
console.log("Using Anon Key:", supabaseKey.substring(0, 10) + "...");

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("Testing getProducts with anon client...");
  try {
    const products = await getProducts(supabase, { locale: "vi", limit: 100 });
    console.log("getProducts returned count:", products?.length);
    if (products && products.length > 0) {
      console.log("Slugs in page 1:", products.map((p: any) => p.slug));
    }
    
    console.log("Testing getProductBySlug for 'ban-tra-da-marble-calacatta'...");
    const product = await getProductBySlug(supabase, "ban-tra-da-marble-calacatta", "vi");
    console.log("getProductBySlug result:", product ? `Found: ${product.name}` : "NOT FOUND");
  } catch (error) {
    console.error("Error in test:", error);
  }
}

runTest();
