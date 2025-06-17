import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';

export default function AdminBlog() {
  const [artigos, setArtigos] = useState([]);
  const [artigoAtual, setArtigoAtual] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [modo, setModo] = useState('lista'); // lista, criar, editar

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [artigosRes, categoriasRes] = await Promise.all([
        api.get('/artigos?admin=true'),
        api.get('/artigos/categorias')
      ]);

      setArtigos(artigosRes.data.artigos);
      setCategorias(categoriasRes.data);
      setCarregando(false);
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      setErro('Erro ao carregar dados');
      setCarregando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      if (artigoAtual.id) {
        await api.put(`/artigos/${artigoAtual.id}`, artigoAtual);
      } else {
        await api.post('/artigos', artigoAtual);
      }

      await carregarDados();
      setModo('lista');
      setArtigoAtual(null);
    } catch (erro) {
      console.error('Erro ao salvar artigo:', erro);
      setErro(erro.response?.data?.erro || 'Erro ao salvar artigo');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este artigo?')) return;

    try {
      await api.delete(`/artigos/${id}`);
      await carregarDados();
    } catch (erro) {
      console.error('Erro ao excluir artigo:', erro);
      setErro('Erro ao excluir artigo');
    }
  };

  const handleUploadImagem = async (file) => {
    try {
      const formData = new FormData();
      formData.append('imagem', file);

      const response = await api.post('/upload/imagem', formData);
      return response.data.url;
    } catch (erro) {
      console.error('Erro ao fazer upload de imagem:', erro);
      setErro('Erro ao fazer upload de imagem');
      return null;
    }
  };

  const handleAdicionarCategoria = async () => {
    if (!novaCategoria.trim()) return;

    try {
      const response = await api.post('/artigos/categorias', {
        nome: novaCategoria
      });

      setCategorias([...categorias, response.data]);
      setNovaCategoria('');
    } catch (erro) {
      console.error('Erro ao adicionar categoria:', erro);
      setErro('Erro ao adicionar categoria');
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
    imageUploader: {
      upload: handleUploadImagem
    }
  };

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gerenciar Blog | Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Blog</h1>
          {modo === 'lista' ? (
            <button
              onClick={() => {
                setArtigoAtual({
                  titulo: '',
                  conteudo: '',
                  categorias: [],
                  publicado: false
                });
                setModo('criar');
              }}
              className="px-4 py-2 bg-primary rounded-lg hover:bg-opacity-90"
            >
              <i className="fas fa-plus mr-2"></i>
              Novo Artigo
            </button>
          ) : (
            <button
              onClick={() => {
                setModo('lista');
                setArtigoAtual(null);
              }}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Voltar
            </button>
          )}
        </header>

        {erro && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8">
            <p className="text-red-400">{erro}</p>
          </div>
        )}

        {modo === 'lista' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {artigos.map((artigo) => (
                <motion.article
                  key={artigo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-900 rounded-lg overflow-hidden shadow-lg"
                >
                  {artigo.imagem && (
                    <img
                      src={artigo.imagem}
                      alt={artigo.titulo}
                      className="w-full h-48 object-cover"
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
                    <h2 className="text-xl font-semibold mb-2">{artigo.titulo}</h2>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <i className="far fa-eye"></i>
                          <span>{artigo.visualizacoes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="far fa-clock"></i>
                          <span>
                            {new Date(artigo.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setArtigoAtual(artigo);
                            setModo('editar');
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-400/20 rounded"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleExcluir(artigo.id)}
                          className="p-2 text-red-400 hover:bg-red-400/20 rounded"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="block mb-2">Título</label>
                <input
                  type="text"
                  value={artigoAtual.titulo}
                  onChange={(e) =>
                    setArtigoAtual({ ...artigoAtual, titulo: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-900 rounded-lg"
                  required
                />
              </div>

              {/* Categorias */}
              <div>
                <label className="block mb-2">Categorias</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.id}
                      type="button"
                      onClick={() => {
                        const categoriasSelecionadas = artigoAtual.categorias || [];
                        const index = categoriasSelecionadas.findIndex(
                          (c) => c.id === categoria.id
                        );

                        if (index === -1) {
                          setArtigoAtual({
                            ...artigoAtual,
                            categorias: [...categoriasSelecionadas, categoria]
                          });
                        } else {
                          categoriasSelecionadas.splice(index, 1);
                          setArtigoAtual({
                            ...artigoAtual,
                            categorias: [...categoriasSelecionadas]
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-full ${
                        artigoAtual.categorias?.some((c) => c.id === categoria.id)
                          ? 'bg-primary text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {categoria.nome}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    placeholder="Nova categoria..."
                    className="flex-1 px-4 py-2 bg-gray-900 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAdicionarCategoria}
                    className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div>
                <label className="block mb-2">Conteúdo</label>
                <ReactQuill
                  value={artigoAtual.conteudo}
                  onChange={(conteudo) =>
                    setArtigoAtual({ ...artigoAtual, conteudo })
                  }
                  modules={modules}
                  className="bg-gray-900 rounded-lg [&_.ql-toolbar]:bg-gray-800 [&_.ql-container]:bg-gray-900 [&_.ql-editor]:min-h-[300px]"
                />
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={artigoAtual.metaTitle || ''}
                    onChange={(e) =>
                      setArtigoAtual({ ...artigoAtual, metaTitle: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-900 rounded-lg"
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    {(artigoAtual.metaTitle || '').length}/60 caracteres
                  </p>
                </div>

                <div>
                  <label className="block mb-2">Meta Description</label>
                  <textarea
                    value={artigoAtual.metaDescription || ''}
                    onChange={(e) =>
                      setArtigoAtual({
                        ...artigoAtual,
                        metaDescription: e.target.value
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-900 rounded-lg"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    {(artigoAtual.metaDescription || '').length}/160 caracteres
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={artigoAtual.publicado}
                    onChange={(e) =>
                      setArtigoAtual({
                        ...artigoAtual,
                        publicado: e.target.checked
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  <span className="ms-3">Publicado</span>
                </label>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setModo('lista');
                    setArtigoAtual(null);
                  }}
                  className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                  disabled={salvando}
                >
                  {salvando ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Salvando...
                    </span>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
