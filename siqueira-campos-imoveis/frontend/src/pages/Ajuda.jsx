import React from 'react';

const perguntas = [
  {
    pergunta: 'Como posso agendar uma visita?',
    resposta: 'Você pode agendar uma visita diretamente na página de detalhes do imóvel, clicando no botão "Agendar Visita".',
  },
  {
    pergunta: 'Quais são os documentos necessários para comprar um imóvel?',
    resposta: 'Os documentos variam conforme o tipo de imóvel e financiamento, mas geralmente incluem RG, CPF, comprovante de renda e comprovante de residência.',
  },
  {
    pergunta: 'Como funciona o simulador de financiamento?',
    resposta: 'O simulador calcula o valor aproximado das parcelas mensais com base no valor do imóvel, entrada e prazo desejado.',
  },
];

export default function Ajuda() {
  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ajuda e Perguntas Frequentes</h1>
      <div className="space-y-6">
        {perguntas.map((item, index) => (
          <div key={index} className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-2">{item.pergunta}</h2>
            <p>{item.resposta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
