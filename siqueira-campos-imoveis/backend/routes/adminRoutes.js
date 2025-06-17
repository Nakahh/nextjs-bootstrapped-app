const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', adminController.login);
router.get('/dashboard', authMiddleware, adminController.getDashboardStats);

module.exports = router;
