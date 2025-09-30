const express = require('express')
const {authMiddleware} = require('../middlewares/auth.middleware')
const {getRecommendedInternships} = require('../controllers/recommendation.controller')
const { securityHeaders, addUserContext } = require('../middlewares/dataValidation.middleware');

const router = express.Router()

// Apply security headers
router.use(securityHeaders);

// Get personalized recommendations (user-specific based on skills)
router.get('/', authMiddleware, addUserContext, getRecommendedInternships )

module.exports = router