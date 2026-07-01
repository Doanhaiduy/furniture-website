const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim().replace(/['"]/g, '');
    }
  }
} catch (e) {}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Check if "project_solutions" root category exists
  const { data: existing, error: findError } = await supabase
    .from('product_categories')
    .select('id')
    .is('parent_id', null)
    .eq('group_key', 'project_solutions');

  if (findError) {
    console.error("Find error:", findError);
    return;
  }

  if (existing && existing.length > 0) {
    console.log("Root category for 'project_solutions' already exists:", existing);
    return;
  }

  // Insert a new root category for "Thiết bị khác"
  const { data: newCat, error: insertError } = await supabase
    .from('product_categories')
    .insert({
      parent_id: null,
      group_key: 'project_solutions',
      status: 'draft',
      sort_order: 99
    })
    .select()
    .single();

  if (insertError) {
    console.error("Insert category error:", insertError);
    return;
  }

  console.log("Inserted category as draft:", newCat);

  // Insert translations
  const { error: transError } = await supabase
    .from('product_category_translations')
    .insert([
      {
        category_id: newCat.id,
        locale: 'vi',
        slug: 'thiet-bi-khac',
        name: 'Thiết bị khác',
        description: 'Các thiết bị và phụ kiện khác'
      },
      {
        category_id: newCat.id,
        locale: 'en',
        slug: 'other-equipment',
        name: 'Other Equipment',
        description: 'Other equipment and accessories'
      }
    ]);

  if (transError) {
    console.error("Insert translations error:", transError);
    return;
  }

  // Update category to published
  const { error: publishError } = await supabase
    .from('product_categories')
    .update({ status: 'published' })
    .eq('id', newCat.id);

  if (publishError) {
    console.error("Publish category error:", publishError);
  } else {
    console.log("Successfully seeded and published 'Thiết bị khác' group!");
  }

  if (transError) {
    console.error("Insert translations error:", transError);
  } else {
    console.log("Successfully seeded 'Thiết bị khác' group!");
  }
}

run();
