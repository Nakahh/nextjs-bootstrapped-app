import { useEffect } from 'react';

const ImovelSchema = ({ imovel }) => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "name": imovel.titulo,
      "description": imovel.descricao,
      "url": `https://siqueiracamposimoveis.com.br/imoveis/${imovel.urlAmigavel}`,
      "datePosted": imovel.criadoEm,
      "image": imovel.imagens?.[0]?.url,
      "price": imovel.precoVenda || imovel.precoAluguel,
      "priceCurrency": "BRL",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": imovel.endereco.logradouro,
        "addressLocality": imovel.endereco.cidade,
        "addressRegion": imovel.endereco.estado,
        "postalCode": imovel.endereco.cep,
        "addressCountry": "BR"
      },
      "numberOfRooms": imovel.quartos,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": imovel.area,
        "unitCode": "MTK"
      },
      "broker": {
        "@type": "RealEstateAgent",
        "name": imovel.corretor?.nome,
        "email": imovel.corretor?.email,
        "telephone": imovel.corretor?.telefone
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [imovel]);

  return null;
};

export default ImovelSchema;
