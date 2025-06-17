import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import api from '../services/api';
import BlogSchema from '../components/BlogSchema';
import CompartilharArtigo from '../components/CompartilharArtigo';
import ImagemLazyLoad from '../components/ImagemLazyLoad';

export default function ArtigoDetalhe() {
  const { urlAmigavel } = useParams();
  const [artigo, setArtigo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarArtigo = async () => {
      try {
        const resposta = await api.get(`/artigos/${urlAmigavel}`);
        setArtigo(resposta.data);
        setCarregando(false);
      } catch (erro) {
        console.error('Erro ao buscar artigo:', erro);
        setErro('Artigo não encontrado');
        setCarregando(false);
      }
    };

    buscarArtigo();
    window.scrollTo(0, 0);
  }, [urlAmigavel]);

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (erro || !artigo) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{erro}</h1>
        <Link to="/blog" className="text-primary hover:underline">
          Voltar para o blog
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{artigo.metaTitle || artigo.titulo}</title>
        <meta
          name="description"
          content={artigo.metaDescription || artigo.conteudo.substring(0, 160)}
        />
        <meta property="og:title" content={artigo.titulo} />
        <meta
          property="og:description"
          content={artigo.metaDescription || artigo.conteudo.substring(0, 160)}
        />
        {artigo.imagem && <meta property="og:image" content={artigo.imagem} />}
        <meta property="og:type" content="article" />
        <meta
          property="article:published_time"
          content={artigo.criadoEm}
        />
        <meta
          property="article:modified_time"
          content={artigo.atualizadoEm}
        />
        {artigo.categorias?.map((categoria) => (
          <meta
            key={categoria.id}
            property="article:tag"
            content={categoria.nome}
          />
        ))}
      </Helmet>

      <BlogSchema tipo="Article" artigo={artigo} />
      <BlogSchema tipo="BreadcrumbList" artigo={artigo} />

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {artigo.categorias?.map((categoria) => (
              <Link
                key={categoria.id}
                to={`/blog?categoria=${categoria.nome}`}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition-colors"
              >
                {categoria.nome}
              </Link>
            ))}
          </div>

          <h1 className="text-4xl font-bold mb-6">{artigo.titulo}</h1>

          {artigo.imagem && (
            <div className="mb-8">
              <ImagemLazyLoad
                src={artigo.imagem}
                alt={artigo.titulo}
                className="rounded-xl"
              />
            </div>
          )}
        </header>

        {/* Conteúdo */}
        <div
          className="prose prose-invert prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: artigo.conteudo }}
        />

        {/* Compartilhamento */}
        <CompartilharArtigo artigo={artigo} />

        {/* Artigos Relacionados */}
        {artigo.artigosRelacionados?.length > 0 && (
          <section className="mt-12 pt-12 border-t border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artigo.artigosRelacionados.map((relacionado) => (
                <motion.article
                  key={relacionado.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  <Link to={`/blog/${relacionado.urlAmigavel}`}>
                    {relacionado.imagem && (
                      <ImagemLazyLoad
                        src={relacionado.imagem}
                        alt={relacionado.titulo}
                        aspectRatio="16/9"
                      />
                    )}
                    <div className="p-6">
                      <div className="flex gap-2 mb-3">
                        {relacionado.categorias?.map((categoria) => (
                          <span
                            key={categoria.id}
                            className="px-2 py-1 text-xs bg-gray-800 rounded-full"
                          >
                            {categoria.nome}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                        {relacionado.titulo}
                      </h3>
                      <p className="text-gray-400 line-clamp-2">
                        {relacionado.conteudo.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </section>
        )}

        {/* Navegação */}
        <nav className="mt-12 pt-8 border-t border-gray-800">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <i className="fas fa-arrow-left"></i>
            Voltar para o blog
          </Link>
        </nav>
      </article>
    </>
  );
}
