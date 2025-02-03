const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Rate limiter for API key requests
const apiLimiter = rateLimit({
    windowMs:process.env.RATE_LIMIT_WINDOW_MS,
    max: process.env.RATE_LIMIT_MAX_REQUESTS,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        const validApiKey = process.env.API_KEY;

        // Check if API key is provided
        if (!apiKey) {
            return res.status(401).json({
                status: 'error',
                message: 'API key is missing in request headers',
                code: 'MISSING_API_KEY'
            });
        }

        // Validate API key
        if (apiKey !== validApiKey) {
            console.warn(`Invalid API key attempt from IP: ${req.ip}`);
            
            return res.status(401).json({
                status: 'error',
                message: 'Invalid API key provided',
                code: 'INVALID_API_KEY'
            });
        }

        req.apiKeyInfo = {
            timestamp: new Date(),
            ip: req.ip,
            path: req.path,
            method: req.method
        };

        next();
    } catch (error) {
        console.error('Authentication error:', {
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            path: req.path
        });

        res.status(500).json({
            status: 'error',
            message: 'Authentication process failed',
            code: 'AUTH_ERROR'
        });
    }
};

// Request logger middleware
const requestLogger = (req, res, next) => {
    // Log request details
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    next();
};

const authMiddleware = [
    apiLimiter,
    securityHeaders,
    requestLogger,
    validateApiKey
];

module.exports = {
    authMiddleware,
    validateApiKey,
    apiLimiter,
    requestLogger,
    securityHeaders
};