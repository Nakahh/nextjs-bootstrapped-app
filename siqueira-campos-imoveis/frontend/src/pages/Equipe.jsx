import React from 'react';

const membros = [
  {
    nome: 'João Silva',
    cargo: 'CEO',
    foto: 'https://randomuser.me/api/portraits/men/32.jpg',
    descricao: 'Líder visionário com mais de 10 anos no mercado imobiliário.',
  },
  {
    nome: 'Maria Oliveira',
    cargo: 'Gerente de Vendas',
    foto: 'https://randomuser.me/api/portraits/women/44.jpg',
    descricao: 'Especialista em atendimento ao cliente e negociação.',
  },
  {
    nome: 'Carlos Souza',
    cargo: 'Desenvolvedor Frontend',
    foto: 'https://randomuser.me/api/portraits/men/65.jpg',
    descricao: 'Responsável pela interface e experiência do usuário.',
  },
];

export default function Equipe() {
  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Nossa Equipe</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {membros.map((membro, index) => (
          <div key={index} className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300 text-center">
            <img
              src={membro.foto}
              alt={membro.nome}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h2 className="text-xl font-semibold">{membro.nome}</h2>
            <p className="text-gray-600 italic mb-2">{membro.cargo}</p>
            <p>{membro.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
