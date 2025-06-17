import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [tentativasFalhas, setTentativasFalhas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Verificar se já está autenticado como admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  // Gerenciar temporizador de bloqueio
  useEffect(() => {
    let timer;
    if (bloqueado && tempoRestante > 0) {
      timer = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            setBloqueado(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bloqueado, tempoRestante]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bloqueado) {
      toast.error(`Aguarde ${tempoRestante} segundos antes de tentar novamente`);
      return;
    }

    setLoading(true);

    try {
      const userData = await login(email, senha);

      if (userData.role !== 'admin') {
        throw new Error('Acesso não autorizado');
      }

      // Resetar contadores de tentativas
      setTentativasFalhas(0);
      toast.success('Login realizado com sucesso!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Incrementar contador de tentativas falhas
      const novasTentativas = tentativasFalhas + 1;
      setTentativasFalhas(novasTentativas);

      // Bloquear após 3 tentativas falhas
      if (novasTentativas >= 3) {
        setBloqueado(true);
        setTempoRestante(300); // 5 minutos
        toast.error('Muitas tentativas falhas. Tente novamente em 5 minutos.');
      } else {
        toast.error(
          error.message === 'Acesso não autorizado'
            ? 'Acesso restrito a administradores'
            : 'Email ou senha incorretos'
        );
      }
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
          Área Administrativa
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acesso restrito a administradores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email administrativo
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={bloqueado || loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={bloqueado || loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {bloqueado && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Acesso temporariamente bloqueado
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Aguarde {Math.floor(tempoRestante / 60)}:
                        {(tempoRestante % 60).toString().padStart(2, '0')} minutos
                        antes de tentar novamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={bloqueado || loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Informações de segurança
                </span>
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              <p className="mb-2">
                • Esta área é monitorada e todos os acessos são registrados
              </p>
              <p className="mb-2">
                • Após 3 tentativas falhas, o acesso será bloqueado por 5 minutos
              </p>
              <p>
                • Em caso de problemas, entre em contato com o suporte técnico
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
