import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL env variable not found in .env.");
  process.exit(1);
}

async function createAdmin() {
  console.log("=== Creating Admin Account ===");
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    await client.connect();

    const adminId = "00000000-0000-0000-0000-000000000002";
    const email = "admin@phuongdong.vn";
    const password = "admin123";

    // Insert into auth.users
    await client.query(`
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, aud, role,
        confirmation_token, recovery_token, email_change_token_new, 
        email_change, phone_change, phone_change_token, 
        email_change_token_current, reauthentication_token, email_change_confirm_status,
        created_at, updated_at
      )
      VALUES (
        $1,
        '00000000-0000-0000-0000-000000000000',
        $2,
        extensions.crypt($3, extensions.gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"Admin Showroom"}'::jsonb,
        'authenticated',
        'authenticated',
        '', '', '', 
        '', '', '', 
        '', '', 0,
        now(), now()
      )
      ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = now(),
        updated_at = now();
    `, [adminId, email, password]);

    // Insert into public.profiles
    await client.query(`
      INSERT INTO public.profiles (id, email, full_name, role, is_active)
      VALUES ($1, $2, 'Admin Showroom', 'admin', true)
      ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active;
    `, [adminId, email]);

    console.log("✅ Admin account created successfully!");
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create admin account:", err);
    process.exit(1);
  }
}

createAdmin();
