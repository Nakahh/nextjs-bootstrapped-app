"use client";

import React, { useEffect, useState } from "react";

export default function AdminFinanceiro() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    tipo: "",
    descricao: "",
    valor: "",
    data: "",
    imovelId: "",
    clienteId: "",
  });

  const fetchRegistros = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/financeiro", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao carregar registros financeiros");
      }
      const data = await response.json();
      setRegistros(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/financeiro", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao criar registro financeiro");
      } else {
        setForm({
          tipo: "",
          descricao: "",
          valor: "",
          data: "",
          imovelId: "",
          clienteId: "",
        });
        fetchRegistros();
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando registros financeiros...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Financeiro</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-6 gap-4">
        <input
          type="text"
          name="tipo"
          placeholder="Tipo"
          value={form.tipo}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="text"
          name="descricao"
          placeholder="Descrição"
          value={form.descricao}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          name="valor"
          placeholder="Valor"
          value={form.valor}
          onChange={handleChange}
          required
          step="0.01"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="date"
          name="data"
          placeholder="Data"
          value={form.data}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          name="imovelId"
          placeholder="ID do Imóvel"
          value={form.imovelId}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          name="clienteId"
          placeholder="ID do Cliente"
          value={form.clienteId}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors col-span-full md:col-auto"
        >
          Adicionar Registro
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Tipo</th>
            <th className="border border-gray-300 p-2">Descrição</th>
            <th className="border border-gray-300 p-2">Valor</th>
            <th className="border border-gray-300 p-2">Data</th>
            <th className="border border-gray-300 p-2">Imóvel ID</th>
            <th className="border border-gray-300 p-2">Cliente ID</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => (
            <tr key={registro.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-2">{registro.id}</td>
              <td className="border border-gray-300 p-2">{registro.tipo}</td>
              <td className="border border-gray-300 p-2">{registro.descricao}</td>
              <td className="border border-gray-300 p-2">R$ {registro.valor.toFixed(2)}</td>
              <td className="border border-gray-300 p-2">{new Date(registro.data).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2">{registro.imovelId || "N/A"}</td>
              <td className="border border-gray-300 p-2">{registro.clienteId || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
