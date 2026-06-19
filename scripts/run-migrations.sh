#!/bin/bash

# Force standard ASCII collation for reliable file sorting (0001 -> 20260618)
export LC_ALL=C

# Script to run all Supabase migrations in order on local Docker or remote Production DB
MIGRATIONS_DIR="supabase/migrations"

# Fallback defaults for local Docker
DB_CONTAINER="supabase-db"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-postgres}"

echo "🚀 Starting migrations..."
echo "================================"

# 1. Determine execution mode (Remote connection string vs. local Docker)
USE_REMOTE=false

if [ -n "$DATABASE_URL" ]; then
    echo "🔗 Using connection string from \$DATABASE_URL"
    USE_REMOTE=true
elif [ -n "$DB_HOST" ]; then
    echo "🔗 Connecting to remote host: $DB_HOST"
    USE_REMOTE=true
else
    echo "🐳 No remote credentials provided. Checking local Docker container: $DB_CONTAINER"
    if ! docker ps | grep -q $DB_CONTAINER; then
        echo "❌ Error: Docker container '$DB_CONTAINER' is not running and no remote credentials (\$DATABASE_URL or \$DB_HOST) were specified."
        echo "💡 To migrate a remote/production DB, set the DATABASE_URL environment variable:"
        echo "   export DATABASE_URL=\"postgresql://user:pass@host:port/dbname\""
        echo "   ./run-migrations.sh"
        exit 1
    fi
fi

# 2. Check migrations directory and count SQL files
total_files=0
for file in "$MIGRATIONS_DIR"/*.sql; do
    # Handle case where no files match the glob
    [ -e "$file" ] || continue
    total_files=$((total_files + 1))
done

if [ "$total_files" -eq 0 ]; then
    echo "⚠️  No migration files found in $MIGRATIONS_DIR"
    exit 0
fi

echo "📁 Found $total_files migration files"
echo ""

# 3. Apply each migration file in alphabetical/numerical order
count=0
failed=0

# Helper function to run psql
run_psql() {
    local sql_file="$1"
    if [ "$USE_REMOTE" = true ]; then
        if [ -n "$DATABASE_URL" ]; then
            # Use connection string (standard method for remote/production databases)
            psql "$DATABASE_URL" < "$sql_file"
        else
            # Use separate environment variables
            PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" < "$sql_file"
        fi
    else
        # Use local Docker container
        docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$sql_file"
    fi
}

for file in "$MIGRATIONS_DIR"/*.sql; do
    [ -e "$file" ] || continue
    count=$((count + 1))
    filename=$(basename "$file")
    
    echo "[$count/$total_files] Running: $filename"
    
    # Run in silent mode to check success
    if run_psql "$file" > /dev/null 2>&1; then
        echo "  ✅ Success"
    else
        echo "  ❌ Failed"
        failed=$((failed + 1))
        
        # Display error details
        echo "  📋 Error details:"
        run_psql "$file" 2>&1 | tail -5 | sed 's/^/     /'
        
        # Ask to continue
        read -p "  ⚠️  Continue with next migration? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Migration stopped by user"
            exit 1
        fi
    fi
    echo ""
done

echo "================================"
echo "✨ Migration completed!"
echo "   Total: $total_files files"
echo "   Success: $((total_files - failed)) files"
echo "   Failed: $failed files"

if [ "$failed" -gt 0 ]; then
    exit 1
fi
