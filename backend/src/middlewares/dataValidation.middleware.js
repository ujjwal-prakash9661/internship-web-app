const User = require('../models/user.model');
const Application = require('../models/application.model');

/**
 * Middleware to ensure users can only access their own data
 */
const validateUserAccess = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const requestedUserId = req.params.userId || req.body.userId;
        
        // If specific user ID is requested, ensure it matches authenticated user
        if (requestedUserId && requestedUserId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Cannot access other users data'
            });
        }
        
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Data validation error',
            error: error.message
        });
    }
};

/**
 * Middleware to validate application ownership
 */
const validateApplicationOwnership = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const applicationId = req.params.applicationId || req.body.applicationId;
        
        if (applicationId) {
            const application = await Application.findById(applicationId);
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
            
            if (application.user.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied: Cannot access other users applications'
                });
            }
        }
        
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Application validation error',
            error: error.message
        });
    }
};

/**
 * Middleware to add user context to all queries
 */
const addUserContext = (req, res, next) => {
    // Add user ID to the request for easy access in controllers
    req.userContext = {
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.name
    };
    next();
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Set user-specific cache headers to prevent data leaking between users
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
};

module.exports = {
    validateUserAccess,
    validateApplicationOwnership,
    addUserContext,
    securityHeaders
};