const express = require('express');
const { getDashboardOverview, getUserStats, updateProfile } = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { securityHeaders, addUserContext, validateUserAccess } = require('../middlewares/dataValidation.middleware');

const router = express.Router();

// Apply security headers to all routes
router.use(securityHeaders);

// Get dashboard overview data (user-isolated)
router.get('/overview', authMiddleware, addUserContext, getDashboardOverview);

// Get user stats (user-isolated)
router.get('/stats', authMiddleware, addUserContext, getUserStats);

// Update user profile (user-isolated with validation)
router.put('/profile', authMiddleware, validateUserAccess, updateProfile);

module.exports = router;