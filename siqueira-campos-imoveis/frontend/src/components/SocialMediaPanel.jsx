import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const SocialMediaPanel = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState({
    content: '',
    platforms: [],
    scheduledDate: '',
    image: null
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  useEffect(() => {
    fetchSocialMediaData();
  }, []);

  const fetchSocialMediaData = async () => {
    try {
      setLoading(true);
      const [accountsRes, postsRes, analyticsRes] = await Promise.all([
        api.endpoints.socialMedia.accounts(),
        api.endpoints.socialMedia.scheduledPosts(),
        api.endpoints.socialMedia.analytics()
      ]);

      setSocialAccounts(accountsRes.data);
      setScheduledPosts(postsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching social media data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost((prev) => ({
        ...prev,
        image: file
      }));
    }
  };

  const handlePlatformToggle = (platform) => {
    setNewPost((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('content', newPost.content);
      formData.append('platforms', JSON.stringify(newPost.platforms));
      formData.append('scheduledDate', newPost.scheduledDate);
      if (newPost.image) {
        formData.append('image', newPost.image);
      }

      await api.endpoints.socialMedia.createPost(formData);
      await fetchSocialMediaData();
      setShowNewPostForm(false);
      setNewPost({
        content: '',
        platforms: [],
        scheduledDate: '',
        image: null
      });
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduledPost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      setLoading(true);
      await api.endpoints.socialMedia.deletePost(postId);
      await fetchSocialMediaData();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEngagement = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
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
            <h2 className="text-xl font-bold">Redes Sociais</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-2 rounded-lg ${
                activeTab === 'posts'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 rounded-lg ${
                activeTab === 'analytics'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'posts' ? (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4"
                >
                  <button
                    onClick={() => setShowNewPostForm(true)}
                    className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 mb-6"
                  >
                    Novo Post
                  </button>

                  <div className="space-y-4">
                    {scheduledPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            {post.platforms.map((platform) => (
                              <span
                                key={platform}
                                className="text-sm bg-gray-200 px-2 py-1 rounded"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => deleteScheduledPost(post.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-gray-800 mb-2">{post.content}</p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt="Post preview"
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        )}
                        <div className="text-sm text-gray-500">
                          Agendado para:{' '}
                          {new Date(post.scheduledDate).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4"
                >
                  {analytics && (
                    <div className="space-y-6">
                      {socialAccounts.map((account) => (
                        <div
                          key={account.platform}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <h3 className="font-bold mb-4">{account.platform}</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {formatEngagement(
                                  analytics[account.platform].followers
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                Seguidores
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">
                                {formatEngagement(
                                  analytics[account.platform].engagement
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                Engajamento
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* New Post Form Modal */}
        {showNewPostForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold mb-4">Novo Post</h3>
              <form onSubmit={handlePostSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plataformas
                    </label>
                    <div className="flex gap-2">
                      {socialAccounts.map((account) => (
                        <button
                          key={account.platform}
                          type="button"
                          onClick={() => handlePlatformToggle(account.platform)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            newPost.platforms.includes(account.platform)
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {account.platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conteúdo
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          content: e.target.value
                        }))
                      }
                      rows="4"
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Digite o conteúdo do post..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Imagem
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Publicação
                    </label>
                    <input
                      type="datetime-local"
                      value={newPost.scheduledDate}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          scheduledDate: e.target.value
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowNewPostForm(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
                  >
                    {loading ? 'Agendando...' : 'Agendar Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SocialMediaPanel;
