import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load env variables
dotenv.config();

const BACKUP_DIR = path.join(process.cwd(), "backups");
const CONTAINER_NAME = "supabase_db_furniture-website";

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, "-");
}

function runCommand(command: string): string {
  console.log(`Executing: ${command}`);
  try {
    const stdout = execSync(command, { stdio: "pipe" });
    return stdout.toString();
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any;
    console.error(`Command failed: ${command}`);
    if (error.stderr) {
      console.error(`Error details: ${error.stderr.toString()}`);
    }
    throw error;
  }
}

function backup() {
  console.log("=== Starting Database Backup ===");
  const timestamp = getTimestamp();
  const outputFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

  try {
    console.log(`Attempting to dump using docker exec on container: ${CONTAINER_NAME}...`);
    // Run pg_dump inside the docker container, writing output to host file
    const command = `docker exec -i ${CONTAINER_NAME} pg_dump -U postgres -d postgres --data-only`;
    const data = execSync(command);
    fs.writeFileSync(outputFile, data);
    console.log(`Backup completed successfully: ${outputFile}`);
    
    // Log backup metadata
    const stats = fs.statSync(outputFile);
    console.log(`Backup file size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log("=== Backup Process Finished ===");
    return outputFile;
  } catch (err) {
    console.log("Docker backup failed. Falling back to local Supabase CLI dump...");
    try {
      runCommand(`npx supabase db dump --local --data-only -f "${outputFile}"`);
      console.log(`Backup completed successfully via Supabase CLI: ${outputFile}`);
      return outputFile;
    } catch (e) {
      console.error("All backup methods failed:", err);
      throw err;
    }
  }
}

function restore(backupFile: string) {
  console.log(`=== Starting Database Restore from ${backupFile} ===`);
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file does not exist: ${backupFile}`);
  }

  try {
    // Reset database to clean schema first (highly recommended for local development)
    console.log("Resetting database to clean schema...");
    try {
      runCommand("npx supabase db reset");
      console.log("Database reset successfully.");
    } catch (e) {
      console.log("Supabase db reset failed or not available. Proceeding with direct restore...");
    }

    console.log(`Restoring data using docker exec on container: ${CONTAINER_NAME}...`);
    // Run psql inside the docker container, piping the backup file content
    const rawSql = fs.readFileSync(backupFile, "utf8");
    
    // Disable triggers/foreign keys check by setting session_replication_role to replica
    const sqlContent = `SET session_replication_role = 'replica';\n${rawSql}\nSET session_replication_role = 'origin';\n`;
    
    // Using execSync with input option allows us to feed stdin to the docker command cleanly
    execSync(`docker exec -i ${CONTAINER_NAME} psql -U postgres -d postgres`, {
      input: Buffer.from(sqlContent, "utf8"),
      stdio: "pipe"
    });
    
    console.log("Restore completed successfully via Docker container psql.");
    console.log("=== Restore Process Finished ===");
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const error = err as any;
    console.error("Restore failed:", error);
    if (error.stderr) {
      console.error(`Error details: ${error.stderr.toString()}`);
    }
    throw error;
  }
}

// Command line interface
const args = process.argv.slice(2);
const action = args[0] || "backup";

if (action === "backup") {
  backup();
} else if (action === "restore") {
  const file = args[1];
  if (!file) {
    console.error("Please specify a backup file to restore. Example: npx tsx scripts/backup.ts restore backups/backup-xxx.sql");
    process.exit(1);
  }
  restore(file);
} else {
  console.error(`Unknown action: ${action}. Use 'backup' or 'restore'.`);
  process.exit(1);
}
