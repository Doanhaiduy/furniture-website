const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
  });
  await client.connect();

  console.log("Checking current site settings...");
  const currentSettings = await client.query("SELECT * FROM public.site_settings LIMIT 1");
  console.log("Current Record:", currentSettings.rows[0]);

  if (currentSettings.rows.length === 0) {
    console.log("No site settings record found to update.");
    await client.end();
    return;
  }

  const settingsId = currentSettings.rows[0].id;

  console.log("Updating hotline to '1900 8888' and email to 'contact@company.vn'...");
  const updateRes = await client.query(`
    UPDATE public.site_settings 
    SET contact_phone = '1900 8888', contact_email = 'contact@company.vn', updated_at = now()
    WHERE id = $1
    RETURNING id, contact_phone, contact_email
  `, [settingsId]);

  console.log("Updated Record:", updateRes.rows[0]);

  await client.end();
}

main().catch(console.error);
