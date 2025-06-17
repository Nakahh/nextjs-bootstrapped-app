import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import NotificationsPanel from '../components/NotificationsPanel';
import ChatPanel from '../components/ChatPanel';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalImoveis: 0,
    imoveisAtivos: 0,
    visitasHoje: 0,
    visitasPendentes: 0,
    leadsMes: 0,
    vendasMes: 0,
    valorVendasMes: 0,
    clientesNovos: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        api.endpoints.admin.dashboard(),
        api.endpoints.admin.stats({ limit: 10 })
      ]);
      setStats(statsRes.data);
      setRecentActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-600 text-sm">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold">{value}</p>
        {trend && (
          <span
            className={`ml-2 text-sm ${
              trend > 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">
              Bem-vindo, {user?.nome}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              🔔
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              💬
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Imóveis Cadastrados"
            value={stats.totalImoveis}
            icon="🏠"
          />
          <StatCard
            title="Visitas Hoje"
            value={stats.visitasHoje}
            icon="👥"
            trend={15}
          />
          <StatCard
            title="Leads este Mês"
            value={stats.leadsMes}
            icon="📊"
            trend={8}
          />
          <StatCard
            title="Vendas este Mês"
            value={`R$ ${stats.valorVendasMes.toLocaleString()}`}
            icon="💰"
            trend={12}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/admin/imoveis/novo"
            className="bg-black text-white p-4 rounded-lg hover:bg-gray-900 transition-colors text-center"
          >
            Cadastrar Imóvel
          </Link>
          <Link
            to="/admin/visitas"
            className="bg-black text-white p-4 rounded-lg hover:bg-gray-900 transition-colors text-center"
          >
            Gerenciar Visitas
          </Link>
          <Link
            to="/admin/blog/novo"
            className="bg-black text-white p-4 rounded-lg hover:bg-gray-900 transition-colors text-center"
          >
            Criar Post
          </Link>
          <Link
            to="/admin/relatorios"
            className="bg-black text-white p-4 rounded-lg hover:bg-gray-900 transition-colors text-center"
          >
            Gerar Relatórios
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Atividades Recentes</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">{activity.icon}</div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Tarefas Pendentes</h2>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="font-medium">Visitas para Confirmar</p>
                  <p className="text-sm text-gray-600">
                    {stats.visitasPendentes} visitas aguardando confirmação
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium">Leads para Contatar</p>
                  <p className="text-sm text-gray-600">
                    {stats.leadsMes} leads aguardando contato
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium">Documentos para Revisar</p>
                  <p className="text-sm text-gray-600">
                    3 documentos aguardando revisão
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Panels */}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
      {showChat && <ChatPanel onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default AdminDashboard;
