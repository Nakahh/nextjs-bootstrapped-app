import React from 'react'

export default function Politicas() {
  return (
    <div className="min-h-screen bg-white text-black px-6 py-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Políticas</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Política de Privacidade</h2>
        <p>Respeitamos sua privacidade e protegemos seus dados pessoais conforme a legislação vigente. Não compartilhamos suas informações com terceiros sem seu consentimento.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Termos de Uso</h2>
        <p>Ao utilizar nosso site, você concorda com nossos termos de uso, que incluem regras para uso adequado dos serviços e responsabilidades do usuário.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <p>Utilizamos cookies para melhorar sua experiência de navegação, personalizar conteúdo e analisar o tráfego do site.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Contato</h2>
        <p>Para dúvidas sobre nossas políticas, entre em contato conosco pelo formulário de contato.</p>
      </section>
    </div>
  )
}
