"use client";

import React from "react";
import ClienteContactHistory from "../components/ClienteContactHistory";

export default function ClienteArea() {
  // Para demonstração, clienteId fixo. Em app real, obter do contexto/autenticação.
  const clienteId = 1;

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Área do Cliente</h1>
        <p className="text-gray-700 mt-2">
          Gerencie seus imóveis favoritos, visitas agendadas e perfil.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4">Imóveis Favoritos</h2>
          <p>Visualize e gerencie seus imóveis favoritos.</p>
        </div>
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4">Visitas Agendadas</h2>
          <p>Confira suas visitas agendadas e detalhes.</p>
        </div>
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300 md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Perfil</h2>
          <p>Atualize suas informações pessoais e preferências.</p>
        </div>
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300 md:col-span-2">
          <ClienteContactHistory clienteId={clienteId} />
        </div>
        <div className="border rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-300 md:col-span-2">
          <ClienteTags clienteId={clienteId} />
        </div>
      </section>
    </div>
  );
}
