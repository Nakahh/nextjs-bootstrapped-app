import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ImagemLazyLoad from '../components/ImagemLazyLoad';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    tipo: 'todos',
    operacao: 'todos',
    cidade: '',
    bairro: '',
    minPreco: '',
    maxPreco: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesRes, postsRes] = await Promise.all([
          api.endpoints.imoveis.featured(),
          api.endpoints.artigos.featured()
        ]);

        setFeaturedProperties(propertiesRes.data);
        setLatestPosts(postsRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams(searchParams);
    window.location.href = `/imoveis?${queryParams.toString()}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <ImagemLazyLoad
            src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg"
            alt="Imóveis de Luxo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl text-white"
          >
            <h1 className="text-5xl font-bold mb-6">
              Encontre o Imóvel dos Seus Sonhos
            </h1>
            <p className="text-xl mb-8">
              Sua imobiliária de confiança em Goiânia, com os melhores imóveis e
              condições do mercado.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={searchParams.tipo}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, tipo: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="todos">Tipo de Imóvel</option>
                  <option value="casa">Casa</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="terreno">Terreno</option>
                  <option value="comercial">Comercial</option>
                </select>

                <select
                  value={searchParams.operacao}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, operacao: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="todos">Tipo de Operação</option>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>

                <input
                  type="text"
                  value={searchParams.cidade}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, cidade: e.target.value })
                  }
                  placeholder="Cidade"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  value={searchParams.bairro}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, bairro: e.target.value })
                  }
                  placeholder="Bairro"
                  className="form-input"
                />

                <input
                  type="number"
                  value={searchParams.minPreco}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, minPreco: e.target.value })
                  }
                  placeholder="Preço Mínimo"
                  className="form-input"
                />

                <input
                  type="number"
                  value={searchParams.maxPreco}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, maxPreco: e.target.value })
                  }
                  placeholder="Preço Máximo"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Buscar Imóveis
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">Imóveis em Destaque</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <motion.div
                  key={property.id}
                  variants={itemVariants}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <Link to={`/imoveis/${property.id}`}>
                    <ImagemLazyLoad
                      src={property.imagens[0]}
                      alt={property.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{property.titulo}</h3>
                      <p className="text-gray-600 mb-2">{property.bairro}, {property.cidade}</p>
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

            <div className="text-center mt-8">
              <Link
                to="/imoveis"
                className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Ver Todos os Imóveis
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">Blog Imobiliário</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <Link to={`/blog/${post.id}`}>
                    <ImagemLazyLoad
                      src={post.imagem}
                      alt={post.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{post.titulo}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.resumo}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{new Date(post.data).toLocaleDateString('pt-BR')}</span>
                        <span>{post.categoria}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/blog"
                className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Ver Todas as Publicações
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Encontrar seu Imóvel?
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Entre em contato conosco e descubra as melhores oportunidades do mercado
            </p>
            <Link
              to="/contato"
              className="inline-block px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
            >
              Fale Conosco
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
