import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import ImagemLazyLoad from '../components/ImagemLazyLoad';

const ImovelDetalhes = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: '',
    mensagem: '',
    horarioPreferido: ''
  });
  const [similarProperties, setSimilarProperties] = useState([]);

  useEffect(() => {
    fetchPropertyDetails();
    if (user) {
      checkFavorite();
    }
  }, [id, user]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const [propertyRes, similarRes] = await Promise.all([
        api.endpoints.imoveis.get(id),
        api.endpoints.imoveis.similar(id)
      ]);
      setProperty(propertyRes.data);
      setSimilarProperties(similarRes.data);
    } catch (error) {
      console.error('Error fetching property details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await api.endpoints.favoritos.check(id);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (!user) {
        window.location.href = '/login';
        return;
      }

      if (isFavorite) {
        await api.endpoints.favoritos.remove(id);
      } else {
        await api.endpoints.favoritos.add(id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.endpoints.visitas.create({
        imovelId: id,
        ...contactForm
      });
      setShowContactForm(false);
      alert('Solicitação enviada com sucesso! Em breve entraremos em contato.');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Imóvel não encontrado</h1>
          <Link to="/imoveis" className="text-black hover:underline">
            Voltar para lista de imóveis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-[60vh]">
            <ImagemLazyLoad
              src={property.imagens[currentImage]}
              alt={property.titulo}
              className="w-full h-full object-cover"
            />
            {property.imagens.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === 0 ? property.imagens.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === property.imagens.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
                >
                  →
                </button>
              </>
            )}
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-2">
              {property.imagens.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    currentImage === index ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <ImagemLazyLoad
                    src={img}
                    alt={`${property.titulo} - Imagem ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Property Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 mb-8"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.titulo}</h1>
                  <p className="text-gray-600">
                    {property.bairro}, {property.cidade}
                  </p>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full ${
                    isFavorite ? 'text-red-500' : 'text-gray-400'
                  } hover:bg-gray-100`}
                >
                  ♥
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{property.quartos}</div>
                  <div className="text-gray-600">Quartos</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{property.suites}</div>
                  <div className="text-gray-600">Suítes</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{property.vagas}</div>
                  <div className="text-gray-600">Vagas</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold">{property.area}m²</div>
                  <div className="text-gray-600">Área Total</div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Descrição</h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {property.descricao}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Características</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.caracteristicas.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-600"
                    >
                      <span className="mr-2">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {property.video && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Tour Virtual</h2>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={property.video}
                      title="Tour Virtual"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-24"
            >
              <div className="text-3xl font-bold mb-4">
                {property.preco.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </div>

              <button
                onClick={() => setShowContactForm(true)}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors mb-4"
              >
                Agendar Visita
              </button>

              <a
                href={`https://wa.me/5562999999999?text=Olá! Tenho interesse no imóvel ${property.titulo} (Ref: ${property.id})`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
              >
                Contato via WhatsApp
              </a>

              {showContactForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                  >
                    <h3 className="text-xl font-bold mb-4">Agendar Visita</h3>
                    <form onSubmit={handleContactSubmit}>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={contactForm.nome}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, nome: e.target.value })
                          }
                          placeholder="Nome"
                          required
                          className="form-input"
                        />
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              email: e.target.value
                            })
                          }
                          placeholder="Email"
                          required
                          className="form-input"
                        />
                        <input
                          type="tel"
                          value={contactForm.telefone}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              telefone: e.target.value
                            })
                          }
                          placeholder="Telefone"
                          required
                          className="form-input"
                        />
                        <textarea
                          value={contactForm.mensagem}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              mensagem: e.target.value
                            })
                          }
                          placeholder="Mensagem"
                          rows="4"
                          className="form-input"
                        />
                        <select
                          value={contactForm.horarioPreferido}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              horarioPreferido: e.target.value
                            })
                          }
                          className="form-select"
                          required
                        >
                          <option value="">Horário Preferido</option>
                          <option value="manha">Manhã</option>
                          <option value="tarde">Tarde</option>
                          <option value="noite">Noite</option>
                        </select>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
                        >
                          Enviar
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Imóveis Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarProperties.map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <Link to={`/imoveis/${property.id}`}>
                    <ImagemLazyLoad
                      src={property.imagens[0]}
                      alt={property.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">
                        {property.titulo}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {property.bairro}, {property.cidade}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">
                          {property.preco.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </span>
                        <span className="badge badge-gray">{property.tipo}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImovelDetalhes;
