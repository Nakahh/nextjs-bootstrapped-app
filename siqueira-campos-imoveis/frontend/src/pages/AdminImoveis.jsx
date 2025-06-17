import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function AdminImoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [imovelEmEdicao, setImovelEmEdicao] = useState(null);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [corretores, setCorretores] = useState([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '',
    status: '',
    tipoNegocio: '',
    ordem: 'recentes'
  });
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    total: 0,
    limite: 10
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    buscarImoveis();
    buscarCaracteristicas();
    buscarCorretores();
  }, [filtros, paginacao.pagina]);

  const buscarImoveis = async () => {
    try {
      const response = await api.get('/imoveis', {
        params: {
          ...filtros,
          pagina: paginacao.pagina,
          limite: paginacao.limite
        }
      });

      setImoveis(response.data.imoveis);
      setPaginacao(prev => ({
        ...prev,
        total: response.data.total
      }));
    } catch (erro) {
      console.error('Erro ao buscar imóveis:', erro);
      toast.error('Erro ao carregar imóveis');
    } finally {
      setCarregando(false);
    }
  };

  const buscarCaracteristicas = async () => {
    try {
      const response = await api.get('/imoveis/caracteristicas/listar');
      setCaracteristicas(response.data);
    } catch (erro) {
      console.error('Erro ao buscar características:', erro);
    }
  };

  const buscarCorretores = async () => {
    try {
      const response = await api.get('/usuarios', {
        params: { papel: 'CORRETOR' }
      });
      setCorretores(response.data);
    } catch (erro) {
      console.error('Erro ao buscar corretores:', erro);
    }
  };

  const abrirModal = (imovel = null) => {
    setImovelEmEdicao(imovel);
    if (imovel) {
      reset(imovel);
    } else {
      reset({
        tipo: 'CASA',
        status: 'DISPONIVEL',
        tipoNegocio: 'VENDA',
        mobiliado: false,
        destaque: false
      });
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setImovelEmEdicao(null);
  };

  const onSubmit = async (dados) => {
    try {
      if (imovelEmEdicao) {
        await api.put(`/imoveis/${imovelEmEdicao.id}`, dados);
        toast.success('Imóvel atualizado com sucesso!');
      } else {
        await api.post('/imoveis', dados);
        toast.success('Imóvel cadastrado com sucesso!');
      }
      
      fecharModal();
      buscarImoveis();
    } catch (erro) {
      console.error('Erro ao salvar imóvel:', erro);
      toast.error('Erro ao salvar imóvel');
    }
  };

  const excluirImovel = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      return;
    }

    try {
      await api.delete(`/imoveis/${id}`);
      toast.success('Imóvel excluído com sucesso!');
      buscarImoveis();
    } catch (erro) {
      console.error('Erro ao excluir imóvel:', erro);
      toast.error('Erro ao excluir imóvel');
    }
  };

  const formatarPreco = (valor) => {
    return valor?.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <>
      <Helmet>
        <title>Gerenciar Imóveis | Painel Administrativo</title>
      </Helmet>

      <div className="p-6">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">Gerenciar Imóveis</h1>
          <button
            onClick={() => abrirModal()}
            className="px-4 py-2 bg-primary rounded-lg hover:bg-opacity-90"
          >
            Novo Imóvel
          </button>
        </header>

        {/* Filtros */}
        <div className="bg-gray-900 rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Buscar imóveis..."
              value={filtros.busca}
              onChange={(e) =>
                setFiltros({ ...filtros, busca: e.target.value })
              }
              className="px-4 py-2 bg-gray-800 rounded-lg"
            />

            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="px-4 py-2 bg-gray-800 rounded-lg"
            >
              <option value="">Todos os tipos</option>
              <option value="CASA">Casa</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="RURAL">Rural</option>
            </select>

            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="px-4 py-2 bg-gray-800 rounded-lg"
            >
              <option value="">Todos os status</option>
              <option value="DISPONIVEL">Disponível</option>
              <option value="VENDIDO">Vendido</option>
              <option value="ALUGADO">Alugado</option>
              <option value="RESERVADO">Reservado</option>
              <option value="LANCAMENTO">Lançamento</option>
            </select>

            <select
              value={filtros.ordem}
              onChange={(e) => setFiltros({ ...filtros, ordem: e.target.value })}
              className="px-4 py-2 bg-gray-800 rounded-lg"
            >
              <option value="recentes">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
              <option value="precoMaior">Maior preço</option>
              <option value="precoMenor">Menor preço</option>
              <option value="visualizacoes">Mais visualizados</option>
            </select>
          </div>
        </div>

        {/* Lista de Imóveis */}
        {carregando ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : imoveis.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nenhum imóvel encontrado</p>
            <button
              onClick={() => setFiltros({})}
              className="text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {imoveis.map((imovel) => (
              <motion.div
                key={imovel.id}
                layout
                className="bg-gray-900 rounded-lg overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 shrink-0">
                    {imovel.imagens?.[0] ? (
                      <img
                        src={imovel.imagens[0].url}
                        alt={imovel.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[12rem] bg-gray-800 flex items-center justify-center">
                        <i className="fas fa-image text-4xl text-gray-600"></i>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                        {imovel.tipo}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                        {imovel.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                        {imovel.tipoNegocio}
                      </span>
                      {imovel.destaque && (
                        <span className="px-2 py-1 text-xs bg-primary rounded-full">
                          Destaque
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-semibold mb-2">{imovel.titulo}</h2>

                    <p className="text-gray-400 mb-4">
                      {imovel.endereco.bairro}, {imovel.endereco.cidade}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <i className="fas fa-ruler-combined"></i>
                        <span>{imovel.area}m²</span>
                      </div>
                      {imovel.quartos > 0 && (
                        <div className="flex items-center gap-1">
                          <i className="fas fa-bed"></i>
                          <span>{imovel.quartos} quartos</span>
                        </div>
                      )}
                      {imovel.suites > 0 && (
                        <div className="flex items-center gap-1">
                          <i className="fas fa-bath"></i>
                          <span>{imovel.suites} suítes</span>
                        </div>
                      )}
                      {imovel.vagas > 0 && (
                        <div className="flex items-center gap-1">
                          <i className="fas fa-car"></i>
                          <span>{imovel.vagas} vagas</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {imovel.precoVenda && (
                          <p className="text-xl font-bold text-primary">
                            {formatarPreco(imovel.precoVenda)}
                          </p>
                        )}
                        {imovel.precoAluguel && (
                          <p className="text-lg">
                            {formatarPreco(imovel.precoAluguel)}/mês
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModal(imovel)}
                          className="p-2 text-primary hover:bg-gray-800 rounded"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => excluirImovel(imovel.id)}
                          className="p-2 text-red-500 hover:bg-gray-800 rounded"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {paginacao.total > paginacao.limite && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() =>
                setPaginacao((prev) => ({ ...prev, pagina: prev.pagina - 1 }))
              }
              disabled={paginacao.pagina === 1}
              className="px-4 py-2 bg-gray-900 rounded-lg disabled:opacity-50"
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from(
              { length: Math.ceil(paginacao.total / paginacao.limite) },
              (_, i) => i + 1
            ).map((p) => (
              <button
                key={p}
                onClick={() =>
                  setPaginacao((prev) => ({ ...prev, pagina: p }))
                }
                className={`px-4 py-2 rounded-lg ${
                  p === paginacao.pagina
                    ? 'bg-primary text-white'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() =>
                setPaginacao((prev) => ({ ...prev, pagina: prev.pagina + 1 }))
              }
              disabled={
                paginacao.pagina ===
                Math.ceil(paginacao.total / paginacao.limite)
              }
              className="px-4 py-2 bg-gray-900 rounded-lg disabled:opacity-50"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      <AnimatePresence>
        {modalAberto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {imovelEmEdicao ? 'Editar Imóvel' : 'Novo Imóvel'}
                </h3>
                <button
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1">Título</label>
                    <input
                      type="text"
                      {...register('titulo', { required: 'Título é obrigatório' })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                    {errors.titulo && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.titulo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1">Tipo de Imóvel</label>
                    <select
                      {...register('tipo')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    >
                      <option value="CASA">Casa</option>
                      <option value="APARTAMENTO">Apartamento</option>
                      <option value="TERRENO">Terreno</option>
                      <option value="COMERCIAL">Comercial</option>
                      <option value="RURAL">Rural</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Status</label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    >
                      <option value="DISPONIVEL">Disponível</option>
                      <option value="VENDIDO">Vendido</option>
                      <option value="ALUGADO">Alugado</option>
                      <option value="RESERVADO">Reservado</option>
                      <option value="LANCAMENTO">Lançamento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Tipo de Negócio</label>
                    <select
                      {...register('tipoNegocio')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    >
                      <option value="VENDA">Venda</option>
                      <option value="ALUGUEL">Aluguel</option>
                      <option value="VENDA_ALUGUEL">Venda ou Aluguel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Preço de Venda</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('precoVenda')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Preço do Aluguel</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('precoAluguel')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Características */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block mb-1">Área (m²)</label>
                    <input
                      type="number"
                      {...register('area', {
                        required: 'Área é obrigatória',
                        min: { value: 1, message: 'Área deve ser maior que 0' }
                      })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                    {errors.area && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.area.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1">Quartos</label>
                    <input
                      type="number"
                      {...register('quartos')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Suítes</label>
                    <input
                      type="number"
                      {...register('suites')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Vagas</label>
                    <input
                      type="number"
                      {...register('vagas')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-1">CEP</label>
                    <input
                      type="text"
                      {...register('endereco.cep', {
                        required: 'CEP é obrigatório'
                      })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Logradouro</label>
                    <input
                      type="text"
                      {...register('endereco.logradouro', {
                        required: 'Logradouro é obrigatório'
                      })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Número</label>
                    <input
                      type="text"
                      {...register('endereco.numero')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Complemento</label>
                    <input
                      type="text"
                      {...register('endereco.complemento')}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Bairro</label>
                    <input
                      type="text"
                      {...register('endereco.bairro', {
                        required: 'Bairro é obrigatório'
                      })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Cidade</label>
                    <input
                      type="text"
                      {...register('endereco.cidade', {
                        required: 'Cidade é obrigatória'
                      })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Estado</label>
                    <input
                      type="text"
                      {...register('endereco.estado', {
                        required: 'Estado é obrigatório'
                      })}
                      className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block mb-1">Descrição</label>
                  <textarea
                    {...register('descricao', {
                      required: 'Descrição é obrigatória'
                    })}
                    rows={5}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                  />
                </div>

                {/* Características */}
                <div>
                  <label className="block mb-2">Características</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {caracteristicas.map((caracteristica) => (
                      <label
                        key={caracteristica.id}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          {...register('caracteristicas')}
                          value={caracteristica.id}
                          className="text-primary"
                        />
                        {caracteristica.nome}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Corretor */}
                <div>
                  <label className="block mb-1">Corretor Responsável</label>
                  <select
                    {...register('corretorId')}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg"
                  >
                    <option value="">Selecione um corretor</option>
                    {corretores.map((corretor) => (
                      <option key={corretor.id} value={corretor.id}>
                        {corretor.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Opções */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('mobiliado')}
                      className="text-primary"
                    />
                    Mobiliado
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('destaque')}
                      className="text-primary"
                    />
                    Destaque
                  </label>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary rounded-lg hover:bg-opacity-90"
                  >
                    {imovelEmEdicao ? 'Atualizar' : 'Cadastrar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
