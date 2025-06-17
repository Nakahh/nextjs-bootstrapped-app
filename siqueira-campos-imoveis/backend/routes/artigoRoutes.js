const express = require('express');
const router = express.Router();
const artigoController = require('../controllers/artigoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { roleMiddleware } = require('../middlewares/roleMiddleware');
const { validationMiddleware } = require('../middlewares/validationMiddleware');
const { body } = require('express-validator');

// Validações
const validarArtigo = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('O título é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('O título deve ter entre 3 e 200 caracteres'),
  
  body('conteudo')
    .trim()
    .notEmpty()
    .withMessage('O conteúdo é obrigatório')
    .isLength({ min: 100 })
    .withMessage('O conteúdo deve ter no mínimo 100 caracteres'),
  
  body('categorias')
    .isArray()
    .withMessage('As categorias devem ser um array')
    .notEmpty()
    .withMessage('Selecione pelo menos uma categoria'),
  
  body('metaTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('O meta title deve ter no máximo 60 caracteres'),
  
  body('metaDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('A meta description deve ter no máximo 160 caracteres'),
  
  body('publicado')
    .optional()
    .isBoolean()
    .withMessage('O campo publicado deve ser um booleano'),

  validationMiddleware
];

// Rotas públicas
router.get('/artigos', artigoController.listarArtigos);
router.get('/artigos/categorias', artigoController.listarCategorias);
router.get('/artigos/:urlAmigavel', artigoController.buscarArtigo);

// Rotas administrativas (protegidas)
router.post(
  '/artigos',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validarArtigo,
  artigoController.criarArtigo
);

router.put(
  '/artigos/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validarArtigo,
  artigoController.atualizarArtigo
);

router.delete(
  '/artigos/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  artigoController.excluirArtigo
);

// Upload de imagens para o editor
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/blog');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

router.post(
  '/upload/imagem',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  upload.single('imagem'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhuma imagem enviada' });
      }

      const url = `/uploads/blog/${req.file.filename}`;
      res.json({ url });
    } catch (erro) {
      console.error('Erro ao fazer upload de imagem:', erro);
      res.status(500).json({ erro: 'Erro ao fazer upload de imagem' });
    }
  }
);

// Middleware de erro para upload
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ erro: 'Arquivo muito grande (máximo 5MB)' });
    }
    return res.status(400).json({ erro: 'Erro no upload do arquivo' });
  }
  next(err);
});

module.exports = router;
