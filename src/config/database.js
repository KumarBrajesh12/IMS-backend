const { Pool } = require('pg');
require('dotenv').config();
const config = require('./config');


// Create pool instance
const pool = new Pool(config.db);

// Pool error handling
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Pool connection management
pool.on('connect', () => {
    console.log('New client connected to database');
});

pool.on('remove', () => {
    console.log('Client removed from pool');
});

// Test database connection function
const testConnection = async () => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, current_database() as database, version() as version');
        console.log('Database connected successfully');
        console.log('Database Details:');
        console.log(`   - Database: ${result.rows[0].database}`);
        console.log(`   - Time: ${result.rows[0].current_time}`);
        console.log(`   - Version: ${result.rows[0].version.split(',')[0]}`);
    } catch (error) {
        console.error('Database connection error:', error.message);
        throw error;
    } finally {
        if (client) client.release();
    }
};

// Query helper function with automatic client release
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
};

// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Health check function
const healthCheck = async () => {
    try {
        const result = await query('SELECT 1');
        return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
        return { status: 'unhealthy', error: error.message };
    }
};

// Initialize database connection
testConnection().catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

module.exports = {
    pool,
    query,
    transaction,
    healthCheck
};