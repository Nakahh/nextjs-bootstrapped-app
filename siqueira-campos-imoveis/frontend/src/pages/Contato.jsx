import React, { useState } from 'react';

export default function Contato() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const response = await fetch('/api/comunicacao/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, mensagem }),
      });
      if (response.ok) {
        setStatus('Mensagem enviada com sucesso!');
        setNome('');
        setEmail('');
        setMensagem('');
      } else {
        setStatus('Erro ao enviar mensagem.');
      }
    } catch (error) {
      setStatus('Erro de conexão.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contato</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nome" className="block mb-1 font-semibold">Nome</label>
          <input
            id="nome"
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-semibold">Email</label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="mensagem" className="block mb-1 font-semibold">Mensagem</label>
          <textarea
            id="mensagem"
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows="5"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Enviar
        </button>
      </form>
      {status && <p className="mt-4 text-center">{status}</p>}
    </div>
  );
}
