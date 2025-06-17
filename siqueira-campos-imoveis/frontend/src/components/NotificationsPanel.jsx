import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';

const NotificationsPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.endpoints.notifications.list({ filter });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.endpoints.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.endpoints.notifications.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'visita':
        return '👥';
      case 'mensagem':
        return '💬';
      case 'imovel':
        return '🏠';
      case 'sistema':
        return '⚙️';
      case 'alerta':
        return '⚠️';
      default:
        return '📢';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Notificações</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === 'unread'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Não lidas ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-black hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <p className="text-2xl mb-2">📭</p>
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`p-4 border-b ${
                    !notification.read ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div
                          className={`font-medium ${
                            !notification.read ? 'text-black' : 'text-gray-600'
                          }`}
                        >
                          {notification.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center gap-4">
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            className="text-sm text-black hover:underline"
                          >
                            Ver detalhes
                          </Link>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-gray-500 hover:underline"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationsPanel;
