const express = require('express');
const authController = require('../controllers/auth.controller')
const {authMiddleware} = require('../middlewares/auth.middleware')

const router = express.Router();

router.post('/register', authController.register)
router.post('/login', authController.login)

router.get('/github', authController.githubLogin);
router.get('/github/callback', authController.githubAuthCallback)

router.get('/profile', authMiddleware, authController.getUserProfile)

module.exports = router;