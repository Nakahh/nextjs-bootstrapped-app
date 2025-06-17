import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import LogoButton from './LogoButton';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isCorretor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mainNavItems = [
    { label: 'Início', path: '/' },
    { label: 'Imóveis', path: '/imoveis' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contato', path: '/contato' },
    { label: 'Simulador', path: '/simulador' }
  ];

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Imóveis', path: '/admin/imoveis' },
    { label: 'Visitas', path: '/admin/visitas' },
    { label: 'Blog', path: '/admin/blog' },
    { label: 'Financeiro', path: '/admin/financeiro' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-white/80 backdrop-blur-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <LogoButton showText={!isScrolled} />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.nome?.[0]?.toUpperCase()}
                    </div>
                    <span>{user.nome?.split(' ')[0]}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2"
                      >
                        {(isAdmin || isCorretor) && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Área Administrativa
                          </Link>
                        )}
                        <Link
                          to="/cliente"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Minha Conta
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sair
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-black"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-white bg-black px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Criar Conta
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                <div
                  className={`h-0.5 bg-black transition-all ${
                    isMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <div
                  className={`h-0.5 bg-black transition-all ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <div
                  className={`h-0.5 bg-black transition-all ${
                    isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="py-4 space-y-2">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block py-2 text-sm font-medium ${
                        location.pathname === item.path
                          ? 'text-black'
                          : 'text-gray-600'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {!user ? (
                    <div className="pt-4 space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full py-2 text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Entrar
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full py-2 text-sm font-medium text-center text-white bg-black rounded-lg hover:bg-gray-900"
                      >
                        Criar Conta
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-4 space-y-2">
                      {(isAdmin || isCorretor) && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2 text-sm font-medium text-gray-600"
                        >
                          Área Administrativa
                        </Link>
                      )}
                      <Link
                        to="/cliente"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 text-sm font-medium text-gray-600"
                      >
                        Minha Conta
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full py-2 text-sm font-medium text-red-600 hover:bg-gray-50 rounded-lg"
                      >
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Admin Navigation */}
      {(isAdmin || isCorretor) && location.pathname.startsWith('/admin') && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gray-100 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-6 overflow-x-auto py-3">
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium whitespace-nowrap ${
                    location.pathname === item.path
                      ? 'text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {location.pathname.startsWith('/admin') ? (
          <div className="pt-32">{children}</div>
        ) : (
          <div className="pt-16">{children}</div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <LogoButton animate={false} className="mb-4" />
              <p className="text-sm text-gray-400">
                Sua imobiliária de confiança em Goiânia
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Navegação</h3>
              <ul className="space-y-2">
                {mainNavItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Rua 1, nº 123</li>
                <li>Setor Central</li>
                <li>Goiânia - GO</li>
                <li>CEP: 74000-000</li>
                <li>Tel: (62) 3333-3333</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-gray-400">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p>
                © {new Date().getFullYear()} Siqueira Campos Imóveis. Todos os direitos
                reservados.
              </p>
              <div className="flex gap-4">
                <Link to="/politicas" className="hover:text-white">
                  Políticas de Privacidade
                </Link>
                <Link to="/termos" className="hover:text-white">
                  Termos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
