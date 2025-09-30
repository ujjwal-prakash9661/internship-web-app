const express = require('express');
const { 
    recordInteraction, 
    getUserApplications, 
    getRecentInteractions, 
    getApplicationStatus,
    deleteUserApplication, 
    clearAllUserApplications 
} = require('../controllers/application.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { 
    securityHeaders, 
    addUserContext, 
    validateApplicationOwnership 
} = require('../middlewares/dataValidation.middleware');

const router = express.Router();

// Apply security headers to all routes
router.use(securityHeaders);

// Record user interaction with internship
router.post('/interaction', authMiddleware, addUserContext, recordInteraction);

// Get user's applications (user-isolated)
router.get('/user-applications', authMiddleware, addUserContext, getUserApplications);

// Get user's recent interactions (user-isolated)
router.get('/recent-interactions', authMiddleware, addUserContext, getRecentInteractions);

// Get application status for specific internship (user-isolated)
router.get('/status/:internshipId', authMiddleware, addUserContext, getApplicationStatus);

// Delete specific user application (with ownership validation)
router.delete('/application/:applicationId', authMiddleware, validateApplicationOwnership, deleteUserApplication);

// Clear all user applications (for data cleanup)
router.delete('/clear-all', authMiddleware, addUserContext, clearAllUserApplications);

module.exports = router;