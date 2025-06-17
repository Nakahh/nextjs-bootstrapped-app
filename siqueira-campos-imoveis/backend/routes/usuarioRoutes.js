const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validateUserRegistration, validateLogin } = require('../middlewares/validationMiddleware');

router.post('/register', validateUserRegistration, usuarioController.register);
router.post('/login', validateLogin, usuarioController.login);
router.get('/list-users', usuarioController.listUsers);

module.exports = router;
