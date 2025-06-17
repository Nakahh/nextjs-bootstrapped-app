import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Aguardar carregamento inicial da autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  // Verificar se o usuário está autenticado
  if (!user) {
    // Redirecionar para login e salvar a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se o usuário tem as roles necessárias
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirecionar com base no papel do usuário
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'corretor':
        return <Navigate to="/corretor/dashboard" replace />;
      case 'cliente':
        return <Navigate to="/cliente/area" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Se todas as verificações passarem, renderizar o conteúdo protegido
  return (
    <React.Fragment>
      {/* 
        Wrapper para possível tratamento de expiração de sessão 
        ou outras verificações em tempo real
      */}
      <SessionCheck>{children}</SessionCheck>
    </React.Fragment>
  );
};

// Componente para verificação contínua da sessão
const SessionCheck = ({ children }) => {
  const { user, logout } = useAuth();
  const sessionTimeout = 30 * 60 * 1000; // 30 minutos
  let sessionTimer;

  React.useEffect(() => {
    const resetTimer = () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      sessionTimer = setTimeout(() => {
        // Se não houver atividade, fazer logout
        logout();
      }, sessionTimeout);
    };

    // Eventos para resetar o timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Iniciar timer
    resetTimer();

    // Cleanup
    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [user, logout]);

  return children;
};

// HOC para criar rotas protegidas por role
export const withRoleProtection = (WrappedComponent, allowedRoles = []) => {
  return (props) => (
    <PrivateRoute roles={allowedRoles}>
      <WrappedComponent {...props} />
    </PrivateRoute>
  );
};

// Componentes específicos para cada tipo de rota protegida
export const AdminRoute = ({ children }) => (
  <PrivateRoute roles={['admin']}>
    {children}
  </PrivateRoute>
);

export const CorretorRoute = ({ children }) => (
  <PrivateRoute roles={['admin', 'corretor']}>
    {children}
  </PrivateRoute>
);

export const ClienteRoute = ({ children }) => (
  <PrivateRoute roles={['admin', 'corretor', 'cliente']}>
    {children}
  </PrivateRoute>
);

// Exemplos de uso:
// <AdminRoute>
//   <AdminDashboard />
// </AdminRoute>
//
// <CorretorRoute>
//   <GerenciarImoveis />
// </CorretorRoute>
//
// <ClienteRoute>
//   <AreaCliente />
// </ClienteRoute>
//
// Ou usando o HOC:
// export default withRoleProtection(AdminDashboard, ['admin']);

export default PrivateRoute;
