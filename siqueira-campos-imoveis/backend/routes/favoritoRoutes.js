const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
const autenticarToken = require('../middlewares/authMiddleware');

router.post('/', autenticarToken, favoritoController.addFavorito);
router.delete('/:id', autenticarToken, favoritoController.removeFavorito);

module.exports = router;
