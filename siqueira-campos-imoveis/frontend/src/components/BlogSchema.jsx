import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function BlogSchema({ tipo, artigo }) {
  const baseUrl = window.location.origin;
  const organizacao = {
    '@type': 'Organization',
    name: 'Siqueira Campos Imóveis',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://facebook.com/siqueiracamposimoveis',
      'https://instagram.com/siqueiracamposimoveis',
      'https://linkedin.com/company/siqueira-campos-imoveis'
    ]
  };

  const gerarSchemaArtigo = () => {
    if (!artigo) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: artigo.titulo,
      description: artigo.metaDescription || artigo.conteudo.substring(0, 160),
      image: artigo.imagem ? [artigo.imagem] : undefined,
      datePublished: artigo.criadoEm,
      dateModified: artigo.atualizadoEm,
      author: artigo.autor ? {
        '@type': 'Person',
        name: artigo.autor.nome
      } : undefined,
      publisher: organizacao,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${artigo.urlAmigavel}`
      },
      articleSection: artigo.categorias?.map(c => c.nome).join(', '),
      keywords: artigo.categorias?.map(c => c.nome).join(', ')
    };
  };

  const gerarSchemaBlog = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Blog Siqueira Campos Imóveis',
      description: 'Dicas, tendências e informações sobre o mercado imobiliário',
      url: `${baseUrl}/blog`,
      publisher: organizacao,
      inLanguage: 'pt-BR'
    };
  };

  const gerarSchemaBreadcrumb = () => {
    if (!artigo) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${baseUrl}/blog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: artigo.titulo,
          item: `${baseUrl}/blog/${artigo.urlAmigavel}`
        }
      ]
    };
  };

  const gerarSchema = () => {
    switch (tipo) {
      case 'Article':
        return gerarSchemaArtigo();
      case 'Blog':
        return gerarSchemaBlog();
      case 'BreadcrumbList':
        return gerarSchemaBreadcrumb();
      default:
        return null;
    }
  };

  const schema = gerarSchema();
  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
