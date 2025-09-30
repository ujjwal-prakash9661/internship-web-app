const express = require('express');
const {fetchAndSaveInternships, getAllInternships, searchInternships} = require('../controllers/internship.controller')
const { authMiddleware } = require('../middlewares/auth.middleware')

const router = express.Router();

router.get('/',authMiddleware, getAllInternships)

router.get('/search', authMiddleware, searchInternships)

router.post('/fetch-from-api', authMiddleware, fetchAndSaveInternships)


module.exports = router;