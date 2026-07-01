const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' });
async function check() {
  await client.connect();
  const profileRes = await client.query("SELECT * FROM public.profiles WHERE email = 'editor@furniture.com'");
  console.log("Profile row:", profileRes.rows);
  const userRes = await client.query("SELECT * FROM auth.users WHERE email = 'editor@furniture.com'");
  console.log("User row:", userRes.rows.map(r => ({ id: r.id, email: r.email, encrypted_password: r.encrypted_password, confirmation_token: r.confirmation_token, email_confirmed_at: r.email_confirmed_at })));
  await client.end();
}
check();
