const express = require('express');
const router = express.Router();
const visitaController = require('../controllers/visitaController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.post('/', authMiddleware, authorizeRoles('admin', 'corretor', 'assistente'), visitaController.createVisita);
router.get('/', authMiddleware, authorizeRoles('admin', 'corretor', 'assistente'), visitaController.listVisitas);
router.put('/:id/status', authMiddleware, authorizeRoles('admin', 'corretor', 'assistente'), visitaController.updateVisitaStatus);

module.exports = router;
