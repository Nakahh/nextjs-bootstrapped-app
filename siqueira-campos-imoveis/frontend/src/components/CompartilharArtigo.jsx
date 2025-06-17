import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CompartilharArtigo({ artigo }) {
  const [copiado, setCopiado] = useState(false);
  const url = `${window.location.origin}/blog/${artigo.urlAmigavel}`;

  const redes = [
    {
      nome: 'WhatsApp',
      icone: 'fab fa-whatsapp',
      cor: 'bg-[#25D366] hover:bg-opacity-90',
      link: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${artigo.titulo}\n\n${url}`)}`
    },
    {
      nome: 'Facebook',
      icone: 'fab fa-facebook-f',
      cor: 'bg-[#1877F2] hover:bg-opacity-90',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      nome: 'Twitter',
      icone: 'fab fa-twitter',
      cor: 'bg-[#1DA1F2] hover:bg-opacity-90',
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${artigo.titulo}\n\n${url}`)}`
    },
    {
      nome: 'LinkedIn',
      icone: 'fab fa-linkedin-in',
      cor: 'bg-[#0A66C2] hover:bg-opacity-90',
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      nome: 'Email',
      icone: 'fas fa-envelope',
      cor: 'bg-gray-600 hover:bg-opacity-90',
      link: `mailto:?subject=${encodeURIComponent(artigo.titulo)}&body=${encodeURIComponent(`Olá! Achei este artigo interessante e gostaria de compartilhar com você:\n\n${artigo.titulo}\n${url}`)}`
    }
  ];

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (erro) {
      console.error('Erro ao copiar link:', erro);
    }
  };

  return (
    <div className="border-t border-b border-gray-800 py-8">
      {/* Autor */}
      {artigo.autor && (
        <div className="flex items-center gap-4 mb-6">
          <img
            src={artigo.autor.avatar || '/imagens/avatar-padrao.jpg'}
            alt={artigo.autor.nome}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{artigo.autor.nome}</p>
            <time className="text-sm text-gray-400">
              {new Date(artigo.criadoEm).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </time>
          </div>
        </div>
      )}

      {/* Botões de Compartilhamento */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Compartilhe este artigo</h3>
        
        <div className="flex flex-wrap gap-3">
          {redes.map((rede) => (
            <motion.a
              key={rede.nome}
              href={rede.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${rede.cor}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className={rede.icone}></i>
              <span>{rede.nome}</span>
            </motion.a>
          ))}

          <motion.button
            onClick={copiarLink}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              copiado ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className={`fas ${copiado ? 'fa-check' : 'fa-link'}`}></i>
            <span>{copiado ? 'Link Copiado!' : 'Copiar Link'}</span>
          </motion.button>
        </div>
      </div>

      {/* Estatísticas */}
      {artigo.visualizacoes && (
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <i className="far fa-eye"></i>
            <span>{artigo.visualizacoes} visualizações</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="far fa-clock"></i>
            <span>
              {new Date(artigo.criadoEm).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          {artigo.tempoLeitura && (
            <div className="flex items-center gap-1">
              <i className="far fa-file-alt"></i>
              <span>{artigo.tempoLeitura} min de leitura</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
