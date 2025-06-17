import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ImagemLazyLoad from '../components/ImagemLazyLoad';

const Imoveis = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    tipo: searchParams.get('tipo') || 'todos',
    operacao: searchParams.get('operacao') || 'todos',
    cidade: searchParams.get('cidade') || '',
    bairro: searchParams.get('bairro') || '',
    minPreco: searchParams.get('minPreco') || '',
    maxPreco: searchParams.get('maxPreco') || '',
    quartos: searchParams.get('quartos') || 'todos',
    suites: searchParams.get('suites') || 'todos',
    vagas: searchParams.get('vagas') || 'todos',
    areaMin: searchParams.get('areaMin') || '',
    areaMax: searchParams.get('areaMax') || '',
    ordenacao: searchParams.get('ordenacao') || 'recentes'
  });

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.endpoints.imoveis.list({
        page: currentPage,
        ...filters
      });
      setProperties(response.data.items);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setSearchParams({ ...filters, [key]: value });
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6">Filtros de Busca</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select
              value={filters.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              className="form-select"
            >
              <option value="todos">Tipo de Imóvel</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>

            <select
              value={filters.operacao}
              onChange={(e) => handleFilterChange('operacao', e.target.value)}
              className="form-select"
            >
              <option value="todos">Tipo de Operação</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>

            <input
              type="text"
              value={filters.cidade}
              onChange={(e) => handleFilterChange('cidade', e.target.value)}
              placeholder="Cidade"
              className="form-input"
            />

            <input
              type="text"
              value={filters.bairro}
              onChange={(e) => handleFilterChange('bairro', e.target.value)}
              placeholder="Bairro"
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <input
              type="number"
              value={filters.minPreco}
              onChange={(e) => handleFilterChange('minPreco', e.target.value)}
              placeholder="Preço Mínimo"
              className="form-input"
            />

            <input
              type="number"
              value={filters.maxPreco}
              onChange={(e) => handleFilterChange('maxPreco', e.target.value)}
              placeholder="Preço Máximo"
              className="form-input"
            />

            <select
              value={filters.quartos}
              onChange={(e) => handleFilterChange('quartos', e.target.value)}
              className="form-select"
            >
              <option value="todos">Quartos</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>

            <select
              value={filters.suites}
              onChange={(e) => handleFilterChange('suites', e.target.value)}
              className="form-select"
            >
              <option value="todos">Suítes</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <select
              value={filters.vagas}
              onChange={(e) => handleFilterChange('vagas', e.target.value)}
              className="form-select"
            >
              <option value="todos">Vagas de Garagem</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>

            <input
              type="number"
              value={filters.areaMin}
              onChange={(e) => handleFilterChange('areaMin', e.target.value)}
              placeholder="Área Mínima (m²)"
              className="form-input"
            />

            <input
              type="number"
              value={filters.areaMax}
              onChange={(e) => handleFilterChange('areaMax', e.target.value)}
              placeholder="Área Máxima (m²)"
              className="form-input"
            />

            <select
              value={filters.ordenacao}
              onChange={(e) => handleFilterChange('ordenacao', e.target.value)}
              className="form-select"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="preco_menor">Menor Preço</option>
              <option value="preco_maior">Maior Preço</option>
              <option value="area_menor">Menor Área</option>
              <option value="area_maior">Maior Área</option>
            </select>
          </div>
        </motion.div>

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <motion.div
                  key={property.id}
                  variants={itemVariants}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <a href={`/imoveis/${property.id}`}>
                    <ImagemLazyLoad
                      src={property.imagens[0]}
                      alt={property.titulo}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{property.titulo}</h3>
                      <p className="text-gray-600 mb-2">{property.bairro}, {property.cidade}</p>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold">
                          {property.preco.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </span>
                        <span className="badge badge-gray">{property.tipo}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{property.quartos} quartos</span>
                        <span>{property.suites} suítes</span>
                        <span>{property.vagas} vagas</span>
                        <span>{property.area}m²</span>
                      </div>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Imoveis;
