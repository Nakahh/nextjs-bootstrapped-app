import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import BlogSchema from '../components/BlogSchema';
import ImagemLazyLoad from '../components/ImagemLazyLoad';

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artigos, setArtigos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const categoriaSelecionada = searchParams.get('categoria');
  const busca = searchParams.get('busca') || '';
  const ordem = searchParams.get('ordem') || 'recentes';

  useEffect(() => {
    const buscarDados = async () => {
      setCarregando(true);
      try {
        const [artigosRes, categoriasRes] = await Promise.all([
          api.get('/artigos', {
            params: {
              pagina,
              categoria: categoriaSelecionada,
              busca,
              ordem
            }
          }),
          api.get('/artigos/categorias')
        ]);

        setArtigos(artigosRes.data.artigos);
        setTotalPaginas(artigosRes.data.paginas);
        setCategorias(categoriasRes.data);
      } catch (erro) {
        console.error('Erro ao buscar dados:', erro);
        setErro('Erro ao carregar artigos');
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, [pagina, categoriaSelecionada, busca, ordem]);

  const atualizarFiltros = (novosFiltros) => {
    const filtros = { ...Object.fromEntries(searchParams) };
    Object.assign(filtros, novosFiltros);
    
    // Remover filtros vazios
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) delete filtros[key];
    });

    setSearchParams(filtros);
    setPagina(1);
  };

  return (
    <>
      <Helmet>
        <title>Blog | Siqueira Campos Imóveis</title>
        <meta
          name="description"
          content="Dicas, tendências e informações sobre o mercado imobiliário"
        />
      </Helmet>

      <BlogSchema tipo="Blog" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-gray-400">
            Dicas, tendências e informações sobre o mercado imobiliário
          </p>
        </header>

        {/* Filtros */}
        <div className="flex flex-wrap gap-6 mb-8">
          {/* Busca */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={busca}
                onChange={(e) => atualizarFiltros({ busca: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900 rounded-lg pl-10"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          {/* Categorias */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={categoriaSelecionada || ''}
              onChange={(e) => atualizarFiltros({ categoria: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 rounded-lg appearance-none"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nome}>
                  {categoria.nome} ({categoria._count.artigos})
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={ordem}
              onChange={(e) => atualizarFiltros({ ordem: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 rounded-lg appearance-none"
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
              <option value="populares">Mais populares</option>
            </select>
          </div>
        </div>

        {/* Lista de Artigos */}
        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : erro ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{erro}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : artigos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl mb-4">Nenhum artigo encontrado</p>
            <button
              onClick={() => setSearchParams({})}
              className="text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${pagina}-${categoriaSelecionada}-${busca}-${ordem}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {artigos.map((artigo) => (
                <motion.article
                  key={artigo.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  <Link to={`/blog/${artigo.urlAmigavel}`}>
                    {artigo.imagem && (
                      <ImagemLazyLoad
                        src={artigo.imagem}
                        alt={artigo.titulo}
                        aspectRatio="16/9"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex gap-2 mb-3">
                        {artigo.categorias?.map((categoria) => (
                          <span
                            key={categoria.id}
                            className="px-2 py-1 text-xs bg-gray-800 rounded-full"
                          >
                            {categoria.nome}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                        {artigo.titulo}
                      </h2>
                      <p className="text-gray-400 line-clamp-3">
                        {artigo.conteudo.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <i className="far fa-eye"></i>
                          <span>{artigo.visualizacoes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="far fa-clock"></i>
                          <span>
                            {new Date(artigo.criadoEm).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-4 py-2 bg-gray-900 rounded-lg disabled:opacity-50"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPagina(p)}
                className={`px-4 py-2 rounded-lg ${
                  p === pagina
                    ? 'bg-primary text-white'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-4 py-2 bg-gray-900 rounded-lg disabled:opacity-50"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
