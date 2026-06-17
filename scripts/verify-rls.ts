import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL env variable not found in .env.");
  process.exit(1);
}

async function verifyRLS() {
  console.log("=== Starting Security RLS Verification ===");
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();

    // 1. Verify RLS is enabled on all tables in public schema
    console.log("Checking RLS status on all public tables...");
    const rlsQuery = `
      SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
      ORDER BY table_name;
    `;
    const rlsResult = await client.query(rlsQuery);
    
    let allRlsEnabled = true;
    const disabledTables: string[] = [];

    console.log("\nTable RLS Status Matrix:");
    console.log("----------------------------------------");
    for (const row of rlsResult.rows) {
      const status = row.rls_enabled ? "✅ ENABLED" : "❌ DISABLED";
      console.log(`- ${row.table_name.padEnd(35)}: ${status}`);
      if (!row.rls_enabled) {
        allRlsEnabled = false;
        disabledTables.push(row.table_name);
      }
    }
    console.log("----------------------------------------");

    if (allRlsEnabled) {
      console.log("✅ SUCCESS: Row Level Security (RLS) is enabled on all public tables!");
    } else {
      console.error(`❌ FAILURE: RLS is disabled on the following tables: ${disabledTables.join(", ")}`);
    }

    // 2. Query policies defined in the system
    console.log("\nChecking database policy counts...");
    const policiesQuery = `
      SELECT tablename, count(*) as policy_count 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      GROUP BY tablename 
      ORDER BY tablename;
    `;
    const policiesResult = await client.query(policiesQuery);
    console.log("----------------------------------------");
    for (const row of policiesResult.rows) {
      console.log(`- ${row.tablename.padEnd(35)}: ${row.policy_count} policies`);
    }
    console.log("----------------------------------------");

    // 3. Test data access constraints as 'anon' role (simulate public user)
    console.log("\nVerifying anon role read constraints...");
    
    // We will run queries as anon user by starting a transaction and setting the role
    await client.query("BEGIN;");
    try {
      await client.query("SET LOCAL ROLE anon;");
      
      // Try to read settings (should return empty or fail due to RLS)
      try {
        const settingsRes = await client.query("SELECT * FROM public.site_settings;");
        console.log(`- public.site_settings access (anon): Allowed (Returned ${settingsRes.rows.length} rows)`);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = error as any;
        console.log(`- public.site_settings access (anon): Blocked (${e.message})`);
      }

      // Try to read integration_secrets (should fail or return empty due to RLS)
      try {
        const secretsRes = await client.query("SELECT * FROM public.integration_secrets;");
        console.log(`- public.integration_secrets access (anon): Allowed (Returned ${secretsRes.rows.length} rows - WARNING!)`);
        if (secretsRes.rows.length > 0) {
          allRlsEnabled = false;
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = error as any;
        console.log(`- public.integration_secrets access (anon): Blocked/Filtered (${e.message})`);
      }

      // Try to read quote_requests (anon should be blocked or get empty rows)
      try {
        const quotesRes = await client.query("SELECT * FROM public.quote_requests;");
        console.log(`- public.quote_requests access (anon): Returned ${quotesRes.rows.length} rows (Expected 0)`);
        if (quotesRes.rows.length > 0) {
          console.error("❌ SECURITY GAP: Anon role can read quote_requests!");
          allRlsEnabled = false;
        } else {
          console.log("✅ public.quote_requests access (anon): RLS Filtered (0 rows returned)");
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = error as any;
        console.log(`- public.quote_requests access (anon): Blocked (${e.message})`);
      }

    } finally {
      await client.query("ROLLBACK;");
    }

    // 4. Test data access constraints as 'editor' role (using RLS policies or app role checks)
    // Wait, let's verify if there is any other custom RLS checks.
    // In our Supabase schema, the custom user role checks (e.g. editor vs admin) are typically checked
    // by comparing auth.uid() and profiles.role, or handled at Next.js App Router API levels.
    // Let's verify that the profiles table roles are correct.
    const profilesQuery = `SELECT id, email, role FROM public.profiles;`;
    const profilesRes = await client.query(profilesQuery);
    console.log("\nRegistered accounts and roles in database profiles:");
    console.log("----------------------------------------");
    for (const row of profilesRes.rows) {
      console.log(`- User: ${row.email.padEnd(30)} | Role: ${row.role}`);
    }
    console.log("----------------------------------------");

    await client.end();
    
    if (allRlsEnabled) {
      console.log("\n✅ Security check: PASSED");
      process.exit(0);
    } else {
      console.error("\n❌ Security check: FAILED due to violations or disabled RLS");
      process.exit(1);
    }

  } catch (err) {
    console.error("Connection or verification failed:", err);
    process.exit(1);
  }
}

verifyRLS();
