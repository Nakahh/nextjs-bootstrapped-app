import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://siqueiracamposimoveis.com.br/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@SiqueiraCampos:token');
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Tratar erros específicos
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Erro de autenticação
          if (error.config.url !== '/auth/refresh-token') {
            localStorage.removeItem('@SiqueiraCampos:token');
            localStorage.removeItem('@SiqueiraCampos:refreshToken');
            localStorage.removeItem('@SiqueiraCampos:user');
            window.location.href = '/login';
          }
          break;

        case 403:
          // Erro de permissão
          console.error('Acesso não autorizado');
          break;

        case 404:
          // Recurso não encontrado
          console.error('Recurso não encontrado');
          break;

        case 422:
          // Erro de validação
          console.error('Dados inválidos:', error.response.data);
          break;

        case 429:
          // Muitas requisições
          console.error('Muitas requisições. Tente novamente mais tarde.');
          break;

        case 500:
          // Erro interno do servidor
          console.error('Erro interno do servidor');
          break;

        default:
          console.error('Erro na requisição:', error.response.status);
      }
    } else if (error.request) {
      // Erro de conexão
      console.error('Erro de conexão. Verifique sua internet.');
    } else {
      // Erro na configuração da requisição
      console.error('Erro ao configurar requisição:', error.message);
    }

    return Promise.reject(error);
  }
);

// Funções auxiliares para requisições comuns
const apiService = {
  // Autenticação
  auth: {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data)
  },

  // Imóveis
  imoveis: {
    list: (params) => api.get('/imoveis', { params }),
    get: (id) => api.get(`/imoveis/${id}`),
    create: (data) => api.post('/imoveis', data),
    update: (id, data) => api.put(`/imoveis/${id}`, data),
    delete: (id) => api.delete(`/imoveis/${id}`),
    search: (params) => api.get('/imoveis/search', { params }),
    featured: () => api.get('/imoveis/featured'),
    similar: (id) => api.get(`/imoveis/${id}/similar`)
  },

  // Favoritos
  favoritos: {
    list: () => api.get('/favoritos'),
    add: (imovelId) => api.post('/favoritos', { imovelId }),
    remove: (imovelId) => api.delete(`/favoritos/${imovelId}`)
  },

  // Visitas
  visitas: {
    list: () => api.get('/visitas'),
    schedule: (data) => api.post('/visitas', data),
    cancel: (id) => api.delete(`/visitas/${id}`),
    update: (id, data) => api.put(`/visitas/${id}`, data)
  },

  // Artigos
  artigos: {
    list: (params) => api.get('/artigos', { params }),
    get: (id) => api.get(`/artigos/${id}`),
    create: (data) => api.post('/artigos', data),
    update: (id, data) => api.put(`/artigos/${id}`, data),
    delete: (id) => api.delete(`/artigos/${id}`),
    featured: () => api.get('/artigos/featured')
  },

  // Comunicação
  comunicacao: {
    sendMessage: (data) => api.post('/comunicacao/mensagens', data),
    getMessages: () => api.get('/comunicacao/mensagens'),
    markAsRead: (id) => api.put(`/comunicacao/mensagens/${id}/read`)
  },

  // Upload de arquivos
  upload: {
    image: (file, type = 'geral') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    document: (file, type = 'geral') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  },

  // Utilitários
  utils: {
    validateCEP: (cep) => api.get(`/utils/cep/${cep}`),
    getStates: () => api.get('/utils/states'),
    getCities: (state) => api.get(`/utils/cities/${state}`),
    getNeighborhoods: (city) => api.get(`/utils/neighborhoods/${city}`)
  }
};

export default apiService;
