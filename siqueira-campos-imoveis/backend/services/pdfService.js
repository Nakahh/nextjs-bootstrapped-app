/**
 * Serviço para geração de documentos PDF utilizando PDFKit.
 * 
 * Função principal:
 * - generateFichaTecnicaPDF: gera um PDF com informações técnicas do imóvel.
 * 
 * Melhorias sugeridas:
 * - Adicionar suporte a geração assíncrona com filas.
 * - Implementar cache para documentos gerados frequentemente.
 * - Validar dados de entrada para evitar erros na geração.
 */

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function generateFichaTecnicaPDF(imovel) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filePath = path.join(__dirname, '..', 'uploads', `ficha_tecnica_${imovel.id}.pdf`);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      doc.fontSize(20).text('Ficha Técnica do Imóvel', { align: 'center' });
      doc.moveDown();

      doc.fontSize(14).text(`Título: ${imovel.titulo}`);
      doc.text(`Descrição: ${imovel.descricao}`);
      doc.text(`Endereço: ${imovel.endereco}, ${imovel.bairro}, ${imovel.cidade}, CEP: ${imovel.cep}`);
      doc.text(`Tipo: ${imovel.tipo}`);
      doc.text(`Quartos: ${imovel.quartos}`);
      doc.text(`Suítes: ${imovel.suites}`);
      doc.text(`Vagas: ${imovel.vagas}`);
      doc.text(`Área: ${imovel.area} m²`);
      doc.text(`Preço: R$ ${imovel.preco.toFixed(2)}`);
      doc.text(`Status: ${imovel.status}`);

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateFichaTecnicaPDF,
};
