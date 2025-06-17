const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const imovelController = require('../controllers/imovelController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

// Validações comuns
const validacoesImovel = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ max: 100 })
    .withMessage('Título deve ter no máximo 100 caracteres'),
  
  body('descricao')
    .trim()
    .notEmpty()
    .withMessage('Descrição é obrigatória'),
  
  body('tipo')
    .isIn(['CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL', 'RURAL'])
    .withMessage('Tipo de imóvel inválido'),
  
  body('status')
    .isIn(['DISPONIVEL', 'VENDIDO', 'ALUGADO', 'RESERVADO', 'LANCAMENTO'])
    .withMessage('Status inválido'),
  
  body('tipoNegocio')
    .isIn(['VENDA', 'ALUGUEL', 'VENDA_ALUGUEL'])
    .withMessage('Tipo de negócio inválido'),
  
  body('precoVenda')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Preço de venda inválido'),
  
  body('precoAluguel')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Preço de aluguel inválido'),
  
  body('area')
    .isInt({ min: 1 })
    .withMessage('Área inválida'),
  
  body('quartos')
    .isInt({ min: 0 })
    .withMessage('Número de quartos inválido'),
  
  body('suites')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Número de suítes inválido'),
  
  body('banheiros')
    .isInt({ min: 0 })
    .withMessage('Número de banheiros inválido'),
  
  body('vagas')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Número de vagas inválido'),
  
  body('mobiliado')
    .isBoolean()
    .withMessage('Mobiliado deve ser verdadeiro ou falso'),
  
  body('destaque')
    .isBoolean()
    .withMessage('Destaque deve ser verdadeiro ou falso'),
  
  // Validações do endereço
  body('endereco.cep')
    .trim()
    .notEmpty()
    .withMessage('CEP é obrigatório')
    .matches(/^\d{5}-?\d{3}$/)
    .withMessage('CEP inválido'),
  
  body('endereco.logradouro')
    .trim()
    .notEmpty()
    .withMessage('Logradouro é obrigatório'),
  
  body('endereco.bairro')
    .trim()
    .notEmpty()
    .withMessage('Bairro é obrigatório'),
  
  body('endereco.cidade')
    .trim()
    .notEmpty()
    .withMessage('Cidade é obrigatória'),
  
  body('endereco.estado')
    .trim()
    .notEmpty()
    .withMessage('Estado é obrigatório')
    .isLength({ min: 2, max: 2 })
    .withMessage('Estado deve ter 2 caracteres'),
  
  body('endereco.latitude')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude inválida'),
  
  body('endereco.longitude')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude inválida'),
  
  // Validações das imagens
  body('imagens')
    .isArray()
    .withMessage('Imagens deve ser um array'),
  
  body('imagens.*.url')
    .trim()
    .notEmpty()
    .withMessage('URL da imagem é obrigatória')
    .isURL()
    .withMessage('URL da imagem inválida'),
  
  body('imagens.*.legenda')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Legenda deve ter no máximo 100 caracteres'),
  
  // Validações das características
  body('caracteristicas')
    .isArray()
    .withMessage('Características deve ser um array'),
  
  body('caracteristicas.*.nome')
    .trim()
    .notEmpty()
    .withMessage('Nome da característica é obrigatório'),
  
  // Validação do corretor
  body('corretorId')
    .optional()
    .isUUID()
    .withMessage('ID do corretor inválido')
];

// Validações para filtros de busca
const validacoesFiltros = [
  query('tipo')
    .optional()
    .isIn(['CASA', 'APARTAMENTO', 'TERRENO', 'COMERCIAL', 'RURAL'])
    .withMessage('Tipo de imóvel inválido'),
  
  query('status')
    .optional()
    .isIn(['DISPONIVEL', 'VENDIDO', 'ALUGADO', 'RESERVADO', 'LANCAMENTO'])
    .withMessage('Status inválido'),
  
  query('tipoNegocio')
    .optional()
    .isIn(['VENDA', 'ALUGUEL', 'VENDA_ALUGUEL'])
    .withMessage('Tipo de negócio inválido'),
  
  query('precoMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço mínimo inválido'),
  
  query('precoMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço máximo inválido'),
  
  query('areaMin')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Área mínima inválida'),
  
  query('areaMax')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Área máxima inválida'),
  
  query('quartos')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Número de quartos inválido'),
  
  query('suites')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Número de suítes inválido'),
  
  query('vagas')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Número de vagas inválido'),
  
  query('mobiliado')
    .optional()
    .isBoolean()
    .withMessage('Mobiliado deve ser verdadeiro ou falso'),
  
  query('destaque')
    .optional()
    .isBoolean()
    .withMessage('Destaque deve ser verdadeiro ou falso'),
  
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página inválida'),
  
  query('limite')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite inválido'),
  
  query('ordem')
    .optional()
    .isIn(['recentes', 'antigos', 'precoMaior', 'precoMenor', 'areaMaior', 'areaMenor', 'visualizacoes'])
    .withMessage('Ordenação inválida')
];

// Rotas públicas
router.get(
  '/',
  validacoesFiltros,
  validationMiddleware,
  imovelController.listar
);

router.get(
  '/:urlAmigavel',
  param('urlAmigavel').trim().notEmpty().withMessage('URL amigável é obrigatória'),
  validationMiddleware,
  imovelController.buscarPorUrl
);

router.get(
  '/caracteristicas/listar',
  imovelController.listarCaracteristicas
);

router.get(
  '/:id/historico-precos',
  param('id').isUUID().withMessage('ID inválido'),
  validationMiddleware,
  imovelController.historicoPrecos
);

// Rotas administrativas
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'CORRETOR']),
  validacoesImovel,
  validationMiddleware,
  imovelController.criar
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN', 'CORRETOR']),
  param('id').isUUID().withMessage('ID inválido'),
  validacoesImovel,
  validationMiddleware,
  imovelController.atualizar
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  param('id').isUUID().withMessage('ID inválido'),
  validationMiddleware,
  imovelController.excluir
);

module.exports = router;
