import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Validação do nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação do telefone
    const telefoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!telefoneRegex.test(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido. Use o formato (99) 99999-9999';
    }

    // Validação da senha
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (!senhaRegex.test(formData.senha)) {
      newErrors.senha = 'A senha deve conter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais';
    }

    // Validação da confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação do telefone
    if (name === 'telefone') {
      const telefoneFormatado = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
      
      setFormData(prev => ({
        ...prev,
        [name]: telefoneFormatado
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);

    try {
      await register({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha
      });

      toast.success('Cadastro realizado com sucesso! Verifique seu email para ativar sua conta.');
      navigate('/login');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error(error.response?.data?.message || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo siqueira campos imoveis.png"
          alt="Siqueira Campos Imóveis"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            to="/login"
            className="font-medium text-black hover:text-gray-800"
          >
            faça login em sua conta existente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nome */}
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700"
              >
                Nome completo
              </label>
              <div className="mt-1">
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.nome ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                />
                {errors.nome && (
                  <p className="mt-2 text-sm text-red-600">{errors.nome}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Telefone */}
            <div>
              <label
                htmlFor="telefone"
                className="block text-sm font-medium text-gray-700"
              >
                Telefone
              </label>
              <div className="mt-1">
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(99) 99999-9999"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.telefone ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                />
                {errors.telefone && (
                  <p className="mt-2 text-sm text-red-600">{errors.telefone}</p>
                )}
              </div>
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.senha}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.senha ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                />
                {errors.senha && (
                  <p className="mt-2 text-sm text-red-600">{errors.senha}</p>
                )}
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar senha
              </label>
              <div className="mt-1">
                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmarSenha ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                />
                {errors.confirmarSenha && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmarSenha}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </div>
                ) : (
                  'Cadastrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-xs text-gray-500">
              Ao se cadastrar, você concorda com nossos{' '}
              <Link to="/termos" className="text-black hover:text-gray-800">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link to="/privacidade" className="text-black hover:text-gray-800">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
