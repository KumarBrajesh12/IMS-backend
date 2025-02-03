const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const config = require('./src/config/config');
const { apiLimiter } = require('./src/middleware/auth');
const studentRoutes = require('./src/routes/studentRoutes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(apiLimiter);
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use(morgan('dev'));

// Request Time Logger Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// API Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is healthy',
        time: req.requestTime
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Student Management System API',
        version: '1.0.0',
        documentation: '/api-docs', 
        time: req.requestTime
    });
});

// API Routes
app.use('/api/v1', studentRoutes);

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`Error ${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    const error = process.env.NODE_ENV === 'development' ? err : {};
    
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Server Setup
const startServer = async () => {
    try {
        app.listen(config.server.port, () => {
            console.log(`Server running on port ${config.server.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

startServer();

module.exports = app;