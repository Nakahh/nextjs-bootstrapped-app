const express = require('express');
const router = express.Router();
const comunicacaoController = require('../controllers/comunicacaoController');
const autenticarToken = require('../middlewares/authMiddleware');

router.post('/email', autenticarToken, comunicacaoController.sendEmail);

module.exports = router;
