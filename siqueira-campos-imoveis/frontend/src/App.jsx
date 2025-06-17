import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, AdminRoute, CorretorRoute, ClienteRoute } from './components/PrivateRoute';
import Layout from './components/Layout';

// Páginas públicas
import Home from './pages/Home';
import Imoveis from './pages/Imoveis';
import ImovelDetalhes from './pages/ImovelDetalhes';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Blog from './pages/Blog';
import ArtigoDetalhe from './pages/ArtigoDetalhe';
import Contato from './pages/Contato';
import Equipe from './pages/Equipe';
import Politicas from './pages/Politicas';
import Ajuda from './pages/Ajuda';
import Simulador from './pages/Simulador';
import Desenvolvedor from './pages/Desenvolvedor';

// Páginas protegidas
import AdminDashboard from './pages/AdminDashboard';
import AdminImoveis from './pages/AdminImoveis';
import AdminBlog from './pages/AdminBlog';
import AdminVisitas from './pages/AdminVisitas';
import AdminFinanceiro from './pages/AdminFinanceiro';
import ClienteArea from './pages/ClienteArea';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/imoveis" element={<Imoveis />} />
            <Route path="/imovel/:id" element={<ImovelDetalhes />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<ArtigoDetalhe />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/politicas" element={<Politicas />} />
            <Route path="/ajuda" element={<Ajuda />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/desenvolvedor" element={<Desenvolvedor />} />

            {/* Rotas Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/imoveis"
              element={
                <AdminRoute>
                  <AdminImoveis />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/blog"
              element={
                <AdminRoute>
                  <AdminBlog />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/visitas"
              element={
                <AdminRoute>
                  <AdminVisitas />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/financeiro"
              element={
                <AdminRoute>
                  <AdminFinanceiro />
                </AdminRoute>
              }
            />

            {/* Rotas Cliente */}
            <Route
              path="/cliente/area"
              element={
                <ClienteRoute>
                  <ClienteArea />
                </ClienteRoute>
              }
            />

            {/* Rota de Callback do Google */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Rota 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-600 mb-4">
                      Página não encontrada
                    </p>
                    <a
                      href="/"
                      className="text-black hover:text-gray-900 underline"
                    >
                      Voltar para a página inicial
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

// Componente para lidar com o callback do Google
const AuthCallback = () => {
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (token) {
        try {
          await loginWithGoogle(token);
          navigate('/');
        } catch (error) {
          console.error('Erro no callback:', error);
          navigate('/login?error=auth_failed');
        }
      } else if (error) {
        navigate('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [location, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
    </div>
  );
};

export default App;
