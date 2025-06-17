"use client";

import React, { useEffect, useState } from "react";

export default function AdminVisitas() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    imovelId: "",
    clienteId: "",
    data: "",
    status: "Agendada",
  });

  const fetchVisitas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/visitas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao carregar visitas");
      }
      const data = await response.json();
      setVisitas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchVisitas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/visitas", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao criar visita");
      } else {
        setForm({
          imovelId: "",
          clienteId: "",
          data: "",
          status: "Agendada",
        });
        fetchVisitas();
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/visitas/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }
      fetchVisitas();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Carregando visitas...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Agenda de Visitas</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="number"
          name="imovelId"
          placeholder="ID do Imóvel"
          value={form.imovelId}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="number"
          name="clienteId"
          placeholder="ID do Cliente"
          value={form.clienteId}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="datetime-local"
          name="data"
          placeholder="Data e Hora"
          value={form.data}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Agendar Visita
        </button>
      </form>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Imóvel</th>
            <th className="border border-gray-300 p-2">Cliente</th>
            <th className="border border-gray-300 p-2">Data</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {visitas.map((visita) => (
            <tr key={visita.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 p-2">{visita.id}</td>
              <td className="border border-gray-300 p-2">{visita.imovel?.titulo || "N/A"}</td>
              <td className="border border-gray-300 p-2">{visita.cliente?.nome || "N/A"}</td>
              <td className="border border-gray-300 p-2">{new Date(visita.data).toLocaleString()}</td>
              <td className="border border-gray-300 p-2">{visita.status}</td>
              <td className="border border-gray-300 p-2">
                <select
                  value={visita.status}
                  onChange={(e) => handleStatusChange(visita.id, e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="Agendada">Agendada</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Realizada">Realizada</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
