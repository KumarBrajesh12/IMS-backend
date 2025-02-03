require('dotenv').config();

const config = {
    // Environment
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',

    // Server
    server: {
        port: parseInt(process.env.PORT) || 5000,
        host: process.env.HOST || 'localhost',
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    },

    // Database
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME || 'student_management',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },

    // Pagination defaults
    pagination: {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100
    },

    // JWT Configuration (if you plan to add authentication)
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN
    },

    // API Configuration
    api: {
        prefix: '/api/v1',
        versions: ['v1'],
        rateLimiting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        }
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL,
        file: process.env.LOG_FILE
    },

    // Validation settings
    validation: {
        student: {
            nameMinLength: 2,
            nameMaxLength: 50,
            ageMin: 16,
            ageMax: 100
        },
        marks: {
            minScore: 0,
            maxScore: 100
        }
    }
};

// Validation function for required environment variables
const validateConfig = () => {
    const requiredEnvVars = [
        'DB_PASSWORD'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
};

try {
    validateConfig();
} catch (error) {
    console.error('Configuration validation failed:', error.message);
    process.exit(1);
}

module.exports = config;