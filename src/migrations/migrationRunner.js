const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function runMigrations() {
    const client = await pool.connect();
    
    try {
        // Create migration history table
        const historySchema = await fs.readFile(
            path.join(__dirname, 'migrationHistory.sql'),
            'utf8'
        );
        await client.query(historySchema);

        // Get list of applied migrations
        const { rows: appliedMigrations } = await client.query(
            'SELECT migration_name FROM migration_history WHERE status = $1',
            ['success']
        );
        const appliedMigrationNames = new Set(
            appliedMigrations.map(m => m.migration_name)
        );

        // Get all migration files
        const scriptsDir = path.join(__dirname, 'scripts');
        const files = await fs.readdir(scriptsDir);
        const migrationFiles = files
            .filter(f => f.endsWith('.sql'))
            .sort();

        // Run migrations in transaction
        for (const file of migrationFiles) {
            if (!appliedMigrationNames.has(file)) {
                try {
                    await client.query('BEGIN');

                    console.log(`Running migration: ${file}`);
                    const sql = await fs.readFile(
                        path.join(scriptsDir, file),
                        'utf8'
                    );
                    await client.query(sql);

                    // Record successful migration
                    await client.query(
                        `INSERT INTO migration_history 
                        (migration_name, status) VALUES ($1, $2)`,
                        [file, 'success']
                    );

                    await client.query('COMMIT');
                    console.log(`Migration successful: ${file}`);
                } catch (error) {
                    await client.query('ROLLBACK');
                    console.error(`Migration failed: ${file}`);
                    console.error(error);

                    // Record failed migration
                    await client.query(
                        `INSERT INTO migration_history 
                        (migration_name, status, error_message) 
                        VALUES ($1, $2, $3)`,
                        [file, 'failed', error.message]
                    );
                    
                    throw error;
                }
            }
        }
        
        console.log('✨ All migrations completed successfully');
    } catch (error) {
        console.error('Migration process failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

if (require.main === module) {
    runMigrations().catch(console.error);
}

module.exports = { runMigrations };