import { motion } from 'framer-motion';

const Desenvolvedor = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div 
        className="relative h-[60vh] bg-black flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center text-white z-10">
          <motion.h1 
            className="text-5xl font-bold mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            KRYON.IX
          </motion.h1>
          <motion.p 
            className="text-xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Desenvolvimento de Software & Soluções Digitais
          </motion.p>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.section 
        className="py-20 px-4 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Sobre Nós</h2>
          <div className="space-y-6 text-lg">
            <p>
              A KRYON.IX é uma empresa especializada em desenvolvimento de software,
              focada em criar soluções digitais inovadoras e eficientes para nossos clientes.
            </p>
            <p>
              Nossa missão é transformar ideias em realidade através da tecnologia,
              sempre buscando a excelência e a satisfação total de nossos clientes.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        className="py-20 px-4 md:px-8 bg-gray-50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Nossos Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="p-6 bg-white rounded-lg shadow-lg"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4">Desenvolvimento Web</h3>
              <p>Criação de sites, aplicações web e sistemas personalizados.</p>
            </motion.div>
            <motion.div 
              className="p-6 bg-white rounded-lg shadow-lg"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4">Aplicativos Mobile</h3>
              <p>Desenvolvimento de aplicativos iOS e Android nativos e híbridos.</p>
            </motion.div>
            <motion.div 
              className="p-6 bg-white rounded-lg shadow-lg"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4">Consultoria em TI</h3>
              <p>Assessoria técnica e planejamento estratégico em tecnologia.</p>
            </motion.div>
            <motion.div 
              className="p-6 bg-white rounded-lg shadow-lg"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-semibold mb-4">Soluções em Cloud</h3>
              <p>Implementação e gerenciamento de infraestrutura em nuvem.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        className="py-20 px-4 md:px-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Entre em Contato</h2>
          <p className="text-lg mb-8">
            Estamos prontos para ajudar no seu próximo projeto.
          </p>
          <div className="space-y-4">
            <p className="text-lg">Email: contato@kryonix.com.br</p>
            <p className="text-lg">Telefone: (11) 99999-9999</p>
            <p className="text-lg">São Paulo - SP</p>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} KRYON.IX. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Desenvolvedor;
