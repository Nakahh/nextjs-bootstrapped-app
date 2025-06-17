const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.get('/', authMiddleware, authorizeRoles('admin', 'corretor', 'assistente'), financeiroController.listFinanceiro);
router.post('/', authMiddleware, authorizeRoles('admin', 'corretor', 'assistente'), financeiroController.createFinanceiro);

module.exports = router;
