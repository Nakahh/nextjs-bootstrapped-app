const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const autenticarToken = require('../middlewares/authMiddleware');

router.post('/', autenticarToken, clienteController.createCliente);
router.get('/', autenticarToken, clienteController.listClientes);
router.get('/:id', autenticarToken, clienteController.getClienteById);
router.put('/:id', autenticarToken, clienteController.updateCliente);
router.delete('/:id', autenticarToken, clienteController.deleteCliente);

// Novos endpoints para histórico e segmentação
router.post('/:id/contatos', autenticarToken, clienteController.addContato);
router.get('/:id/contatos', autenticarToken, clienteController.listContatos);
router.post('/:id/tags', autenticarToken, clienteController.addTag);
router.get('/:id/tags', autenticarToken, clienteController.listTags);

module.exports = router;
