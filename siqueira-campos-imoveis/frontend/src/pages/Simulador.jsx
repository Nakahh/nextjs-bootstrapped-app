import React, { useState } from 'react'

export default function Simulador() {
  const [formData, setFormData] = useState({
    valorImovel: '',
    entrada: '',
    prazo: '360',
    taxa: '9.5',
    renda: ''
  })

  const [resultado, setResultado] = useState(null)

  const calcularFinanciamento = (e) => {
    e.preventDefault()

    const valor = parseFloat(formData.valorImovel)
    const entrada = parseFloat(formData.entrada)
    const prazo = parseInt(formData.prazo)
    const taxa = parseFloat(formData.taxa) / 100 / 12 // Taxa mensal
    const renda = parseFloat(formData.renda)

    const valorFinanciado = valor - entrada
    
    // Cálculo da parcela usando a fórmula de amortização Price
    const parcela = valorFinanciado * 
      (taxa * Math.pow(1 + taxa, prazo)) / 
      (Math.pow(1 + taxa, prazo) - 1)

    const comprometimentoRenda = (parcela / renda) * 100

    setResultado({
      valorFinanciado: valorFinanciado.toFixed(2),
      parcela: parcela.toFixed(2),
      prazoAnos: (prazo / 12).toFixed(0),
      comprometimentoRenda: comprometimentoRenda.toFixed(1),
      aprovado: comprometimentoRenda <= 30
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simulador de Financiamento</h1>
        <p className="text-gray-400 text-lg">
          Calcule as parcelas e veja se seu financiamento pode ser aprovado
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-8 shadow-lg">
        <form onSubmit={calcularFinanciamento} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Valor do Imóvel (R$)
              </label>
              <input
                type="number"
                required
                className="w-full bg-black border border-gray-800 rounded px-3 py-2"
                value={formData.valorImovel}
                onChange={(e) => setFormData({...formData, valorImovel: e.target.value})}
                placeholder="Ex: 500000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Valor da Entrada (R$)
              </label>
              <input
                type="number"
                required
                className="w-full bg-black border border-gray-800 rounded px-3 py-2"
                value={formData.entrada}
                onChange={(e) => setFormData({...formData, entrada: e.target.value})}
                placeholder="Ex: 150000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prazo (meses)
              </label>
              <select
                className="w-full bg-black border border-gray-800 rounded px-3 py-2"
                value={formData.prazo}
                onChange={(e) => setFormData({...formData, prazo: e.target.value})}
              >
                <option value="180">15 anos (180 meses)</option>
                <option value="240">20 anos (240 meses)</option>
                <option value="300">25 anos (300 meses)</option>
                <option value="360">30 anos (360 meses)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Taxa de Juros Anual (%)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full bg-black border border-gray-800 rounded px-3 py-2"
                value={formData.taxa}
                onChange={(e) => setFormData({...formData, taxa: e.target.value})}
                placeholder="Ex: 9.5"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Renda Mensal (R$)
              </label>
              <input
                type="number"
                required
                className="w-full bg-black border border-gray-800 rounded px-3 py-2"
                value={formData.renda}
                onChange={(e) => setFormData({...formData, renda: e.target.value})}
                placeholder="Ex: 10000"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Calcular Financiamento
          </button>
        </form>
      </div>

      {resultado && (
        <div className="mt-8 bg-gray-900 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Resultado da Simulação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black p-6 rounded-lg">
              <p className="text-gray-400 mb-2">Valor Financiado</p>
              <p className="text-2xl font-bold">
                R$ {parseFloat(resultado.valorFinanciado).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-black p-6 rounded-lg">
              <p className="text-gray-400 mb-2">Parcela Mensal</p>
              <p className="text-2xl font-bold">
                R$ {parseFloat(resultado.parcela).toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-black p-6 rounded-lg">
              <p className="text-gray-400 mb-2">Prazo Total</p>
              <p className="text-2xl font-bold">{resultado.prazoAnos} anos</p>
            </div>

            <div className="bg-black p-6 rounded-lg">
              <p className="text-gray-400 mb-2">Comprometimento da Renda</p>
              <p className="text-2xl font-bold">{resultado.comprometimentoRenda}%</p>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg ${
            resultado.aprovado ? 'bg-green-900' : 'bg-red-900'
          }`}>
            <p className="text-lg">
              {resultado.aprovado
                ? "✓ Seu financiamento tem grandes chances de ser aprovado!"
                : "✗ O comprometimento de renda está acima do recomendado (30%)"}
            </p>
          </div>

          <div className="mt-8 text-gray-400">
            <p className="text-sm">
              * Esta é uma simulação aproximada. Os valores reais podem variar de acordo
              com a política de crédito de cada instituição financeira.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
