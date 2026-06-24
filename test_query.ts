import { createAdminClient } from './lib/supabase/server';

async function test() {
  process.env.NEXT_PUBLIC_USE_MOCK_DATA = "false";
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("public_products", {
    p_locale: "vi",
    p_limit: 10,
  });

  if (error) {
    console.error("RPC Error:", error);
    return;
  }

  console.log("PRODUCTS MEDIA IN DB:");
  data.forEach((p: any) => {
    console.log({
      id: p.id,
      slug: p.slug,
      primary_media: p.primary_media,
      media: p.media,
    });
  });
}

test().catch(console.error);
