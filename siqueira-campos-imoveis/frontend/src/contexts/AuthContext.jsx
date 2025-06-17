import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem('@SiqueiraCampos:token');
      const storedUser = localStorage.getItem('@SiqueiraCampos:user');

      if (storedToken && storedUser) {
        api.defaults.headers.authorization = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));

        try {
          // Verificar se o token ainda é válido
          await api.get('/auth/check-session');
        } catch (error) {
          // Se o token for inválido, fazer logout
          await logout();
        }
      }

      setLoading(false);
    };

    loadStoredAuth();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, user: userData, refreshToken } = response.data;

      localStorage.setItem('@SiqueiraCampos:token', token);
      localStorage.setItem('@SiqueiraCampos:refreshToken', refreshToken);
      localStorage.setItem('@SiqueiraCampos:user', JSON.stringify(userData));

      api.defaults.headers.authorization = `Bearer ${token}`;
      setUser(userData);

      toast.success('Login realizado com sucesso!');

      // Redirecionar com base no papel do usuário
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'corretor') {
        navigate('/corretor/dashboard');
      } else {
        navigate('/cliente/area');
      }

      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao realizar login';
      toast.error(message);
      throw error;
    }
  };

  const loginWithGoogle = async (googleToken) => {
    try {
      const response = await api.post('/auth/google', { token: googleToken });
      const { token, user: userData, refreshToken } = response.data;

      localStorage.setItem('@SiqueiraCampos:token', token);
      localStorage.setItem('@SiqueiraCampos:refreshToken', refreshToken);
      localStorage.setItem('@SiqueiraCampos:user', JSON.stringify(userData));

      api.defaults.headers.authorization = `Bearer ${token}`;
      setUser(userData);

      toast.success('Login com Google realizado com sucesso!');

      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/cliente/area');
      }

      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao realizar login com Google';
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Cadastro realizado com sucesso! Verifique seu email.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao realizar cadastro';
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('@SiqueiraCampos:refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('@SiqueiraCampos:token');
      localStorage.removeItem('@SiqueiraCampos:refreshToken');
      localStorage.removeItem('@SiqueiraCampos:user');
      api.defaults.headers.authorization = '';
      setUser(null);
      navigate('/');
      toast.info('Logout realizado com sucesso!');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      const updatedUser = response.data.user;

      localStorage.setItem('@SiqueiraCampos:user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Perfil atualizado com sucesso!');
      return updatedUser;
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao atualizar perfil';
      toast.error(message);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Email de recuperação enviado com sucesso!');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao enviar email de recuperação';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (token, novaSenha) => {
    try {
      await api.post('/auth/reset-password', { token, novaSenha });
      toast.success('Senha redefinida com sucesso!');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao redefinir senha';
      toast.error(message);
      throw error;
    }
  };

  const refreshUserToken = async () => {
    try {
      const refreshToken = localStorage.getItem('@SiqueiraCampos:refreshToken');
      if (!refreshToken) throw new Error('Refresh token não encontrado');

      const response = await api.post('/auth/refresh-token', { refreshToken });
      const { token: newToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('@SiqueiraCampos:token', newToken);
      localStorage.setItem('@SiqueiraCampos:refreshToken', newRefreshToken);
      api.defaults.headers.authorization = `Bearer ${newToken}`;

      return newToken;
    } catch (error) {
      console.error('Erro ao atualizar token:', error);
      await logout();
      throw error;
    }
  };

  // Interceptor para renovar token automaticamente
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const originalRequest = error.config;

          if (!originalRequest._retry) {
            originalRequest._retry = true;

            try {
              const newToken = await refreshUserToken();
              originalRequest.headers.authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const contextValue = {
    user,
    loading,
    signed: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    refreshUserToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
