import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ChatPanel = ({ onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('');
  const messagesEndRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    fetchConversations();
    initializeWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeWebSocket = () => {
    ws.current = new WebSocket(process.env.REACT_APP_WS_URL);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message' && data.conversationId === selectedChat?.id) {
        setMessages((prev) => [...prev, data.message]);
      } else if (data.type === 'typing') {
        // Handle typing indicator
      }
    };

    ws.current.onclose = () => {
      // Attempt to reconnect after a delay
      setTimeout(initializeWebSocket, 3000);
    };
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.endpoints.chat.conversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await api.endpoints.chat.messages(conversationId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);
      const response = await api.endpoints.chat.sendMessage({
        conversationId: selectedChat.id,
        message: newMessage
      });

      setMessages((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(filter.toLowerCase())
  );

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
            <h2 className="text-xl font-bold">Chat</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Chat List / Messages */}
        <div className="flex-1 flex">
          <AnimatePresence mode="wait">
            {!selectedChat ? (
              // Conversations List
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <p className="text-2xl mb-2">💬</p>
                    <p>Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedChat(conversation)}
                        className="w-full p-4 hover:bg-gray-50 flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                          {conversation.name[0]}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{conversation.name}</div>
                          <div className="text-sm text-gray-500">
                            {conversation.lastMessage}
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              // Chat Messages
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col"
              >
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-4">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ←
                  </button>
                  <div className="flex-1">
                    <div className="font-medium">{selectedChat.name}</div>
                    <div className="text-sm text-gray-500">
                      {selectedChat.status}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user.id
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg p-3 ${
                              message.senderId === user.id
                                ? 'bg-black text-white'
                                : 'bg-gray-100'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderId === user.id
                                  ? 'text-gray-300'
                                  : 'text-gray-500'
                              }`}
                            >
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        'Enviar'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatPanel;
