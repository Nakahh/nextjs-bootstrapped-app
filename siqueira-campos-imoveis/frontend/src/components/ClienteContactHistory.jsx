"use client";

import React, { useEffect, useState } from "react";

export default function ClienteContactHistory({ clienteId }) {
  const [contatos, setContatos] = useState([]);
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchContatos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${clienteId}/contatos`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setContatos(data);
      }
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clienteId) {
      fetchContatos();
    }
  }, [clienteId]);

  const handleAddContato = async (e) => {
    e.preventDefault();
    if (!tipo || !descricao) return;
    try {
      const res = await fetch(`/api/clientes/${clienteId}/contatos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo, descricao }),
      });
      if (res.ok) {
        setTipo("");
        setDescricao("");
        fetchContatos();
      }
    } catch (error) {
      console.error("Erro ao adicionar contato:", error);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Histórico de Contatos</h3>
      <form onSubmit={handleAddContato} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Tipo de contato (ex: ligação, email)"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Adicionar Contato
        </button>
      </form>
      {loading ? (
        <p>Carregando contatos...</p>
      ) : contatos.length === 0 ? (
        <p>Nenhum contato registrado.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {contatos.map((contato) => (
            <li key={contato.id} className="border-b pb-2">
              <p>
                <strong>{contato.tipo}</strong> -{" "}
                {new Date(contato.data).toLocaleDateString()}
              </p>
              <p>{contato.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
