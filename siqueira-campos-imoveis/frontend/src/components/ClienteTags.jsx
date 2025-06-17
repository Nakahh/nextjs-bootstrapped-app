"use client";

import React, { useEffect, useState } from "react";

export default function ClienteTags({ clienteId }) {
  const [tags, setTags] = useState([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${clienteId}/tags`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clienteId) {
      fetchTags();
    }
  }, [clienteId]);

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!nome) return;
    try {
      const res = await fetch(`/api/clientes/${clienteId}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome }),
      });
      if (res.ok) {
        setNome("");
        fetchTags();
      }
    } catch (error) {
      console.error("Erro ao adicionar tag:", error);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Segmentação por Tags</h3>
      <form onSubmit={handleAddTag} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Nome da tag"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Adicionar Tag
        </button>
      </form>
      {loading ? (
        <p>Carregando tags...</p>
      ) : tags.length === 0 ? (
        <p>Nenhuma tag cadastrada.</p>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {tags.map((tag) => (
            <li key={tag.id} className="border-b pb-2">
              {tag.nome}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
