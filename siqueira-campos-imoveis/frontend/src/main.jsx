import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

// Configuração do Axios
import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'https://siqueiracamposimoveis.com.br/api';
axios.defaults.withCredentials = true;

// ID do cliente Google OAuth
const GOOGLE_CLIENT_ID = '7452076957-v6740revpqo1s3f0ek25dr1tpua6q893.apps.googleusercontent.com';

// Interceptor para erros globais
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratar erros de autenticação
    if (error.response?.status === 401) {
      // Limpar dados de autenticação e redirecionar para login
      localStorage.removeItem('@SiqueiraCampos:token');
      localStorage.removeItem('@SiqueiraCampos:user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
