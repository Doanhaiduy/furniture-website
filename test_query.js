const { createAdminClient } = require('./lib/supabase/server');
const { getProductBySlug } = require('./lib/supabase/queries');

async function test() {
  // Mock env variables so that server client works
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
  process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";

  const supabase = createAdminClient();

  console.log("--- Test 1: getProductBySlug('gach-eurotile-hoang-gia', 'vi') ---");
  const p1 = await getProductBySlug(supabase, 'gach-eurotile-hoang-gia', 'vi');
  console.log("Result p1:", p1 ? { id: p1.id, slug: p1.slug, name: p1.name } : null);

  console.log("--- Test 2: getProductBySlug('gach-eurotile-hoang-gia', 'en') ---");
  const p2 = await getProductBySlug(supabase, 'gach-eurotile-hoang-gia', 'en');
  console.log("Result p2:", p2 ? { id: p2.id, slug: p2.slug, name: p2.name } : null);

  console.log("--- Test 3: getProductBySlug('eurotile-royal-tile', 'en') ---");
  const p3 = await getProductBySlug(supabase, 'eurotile-royal-tile', 'en');
  console.log("Result p3:", p3 ? { id: p3.id, slug: p3.slug, name: p3.name } : null);

  console.log("--- Test 4: getProductBySlug('eurotile-royal-tile', 'vi') ---");
  const p4 = await getProductBySlug(supabase, 'eurotile-royal-tile', 'vi');
  console.log("Result p4:", p4 ? { id: p4.id, slug: p4.slug, name: p4.name } : null);
}

test().catch(console.error);
