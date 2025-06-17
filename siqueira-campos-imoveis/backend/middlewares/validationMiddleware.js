const yup = require('yup');

// Esquemas de validação
const schemas = {
  // Autenticação
  login: yup.object().shape({
    email: yup.string().email('Email inválido').required('Email é obrigatório'),
    senha: yup.string().required('Senha é obrigatória')
  }),

  register: yup.object().shape({
    nome: yup.string().required('Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: yup.string().email('Email inválido').required('Email é obrigatório'),
    senha: yup
      .string()
      .required('Senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter letra maiúscula, minúscula, número e caractere especial'
      ),
    telefone: yup
      .string()
      .required('Telefone é obrigatório')
      .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido. Use (99) 99999-9999')
  }),

  forgotPassword: yup.object().shape({
    email: yup.string().email('Email inválido').required('Email é obrigatório')
  }),

  resetPassword: yup.object().shape({
    token: yup.string().required('Token é obrigatório'),
    novaSenha: yup
      .string()
      .required('Nova senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter letra maiúscula, minúscula, número e caractere especial'
      )
  }),

  // Usuário
  updateProfile: yup.object().shape({
    nome: yup.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    telefone: yup
      .string()
      .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Formato inválido. Use (99) 99999-9999')
  }),

  changePassword: yup.object().shape({
    senhaAtual: yup.string().required('Senha atual é obrigatória'),
    novaSenha: yup
      .string()
      .required('Nova senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Senha deve conter letra maiúscula, minúscula, número e caractere especial'
      )
  }),

  // Imóvel
  createImovel: yup.object().shape({
    titulo: yup.string().required('Título é obrigatório'),
    descricao: yup.string().required('Descrição é obrigatória'),
    tipo: yup.string().required('Tipo é obrigatório'),
    preco: yup.number().required('Preço é obrigatório').positive('Preço deve ser positivo'),
    area: yup.number().required('Área é obrigatória').positive('Área deve ser positiva'),
    quartos: yup.number().required('Número de quartos é obrigatório').min(0),
    banheiros: yup.number().required('Número de banheiros é obrigatório').min(0),
    vagas: yup.number().required('Número de vagas é obrigatório').min(0),
    endereco: yup.object().shape({
      rua: yup.string().required('Rua é obrigatória'),
      numero: yup.string().required('Número é obrigatório'),
      bairro: yup.string().required('Bairro é obrigatório'),
      cidade: yup.string().required('Cidade é obrigatória'),
      estado: yup.string().required('Estado é obrigatório'),
      cep: yup.string().required('CEP é obrigatório')
    })
  }),

  // Visita
  agendarVisita: yup.object().shape({
    imovelId: yup.string().required('ID do imóvel é obrigatório'),
    data: yup.date().required('Data é obrigatória').min(new Date(), 'Data deve ser futura'),
    horario: yup.string().required('Horário é obrigatório'),
    observacoes: yup.string()
  }),

  // Artigo
  createArtigo: yup.object().shape({
    titulo: yup.string().required('Título é obrigatório'),
    conteudo: yup.string().required('Conteúdo é obrigatório'),
    resumo: yup.string().required('Resumo é obrigatório'),
    tags: yup.array().of(yup.string())
  }),

  // Comunicação
  enviarMensagem: yup.object().shape({
    destinatarioId: yup.string().required('Destinatário é obrigatório'),
    assunto: yup.string().required('Assunto é obrigatório'),
    mensagem: yup.string().required('Mensagem é obrigatória')
  })
};

// Middleware de validação
const validate = (schema) => async (req, res, next) => {
  try {
    // Se o schema não existir, passa para o próximo middleware
    if (!schema) return next();

    // Validar o corpo da requisição
    await schema.validate(req.body, { abortEarly: false });
    return next();
  } catch (error) {
    // Formatar erros de validação
    const errors = error.inner.reduce((acc, err) => {
      acc[err.path] = err.message;
      return acc;
    }, {});

    return res.status(400).json({
      message: 'Erro de validação',
      errors
    });
  }
};

// Middleware de validação de parâmetros
const validateParams = (schema) => async (req, res, next) => {
  try {
    if (!schema) return next();

    await schema.validate(req.params, { abortEarly: false });
    return next();
  } catch (error) {
    return res.status(400).json({
      message: 'Erro de validação nos parâmetros',
      errors: error.errors
    });
  }
};

// Middleware de validação de query
const validateQuery = (schema) => async (req, res, next) => {
  try {
    if (!schema) return next();

    await schema.validate(req.query, { abortEarly: false });
    return next();
  } catch (error) {
    return res.status(400).json({
      message: 'Erro de validação nos parâmetros de consulta',
      errors: error.errors
    });
  }
};

module.exports = {
  validate,
  validateParams,
  validateQuery,
  schemas
};
