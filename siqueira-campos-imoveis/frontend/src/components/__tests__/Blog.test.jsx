import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BlogSchema from '../BlogSchema';
import CompartilharArtigo from '../CompartilharArtigo';
import ImagemLazyLoad from '../ImagemLazyLoad';

// Mock do window.location
const mockLocation = new URL('http://localhost:3000');
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock do navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn()
  }
});

// Mock do IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('BlogSchema', () => {
  const artigoMock = {
    titulo: 'Título do Artigo',
    metaDescription: 'Descrição do artigo para SEO',
    conteudo: 'Conteúdo completo do artigo',
    imagem: '/imagem-artigo.jpg',
    urlAmigavel: 'titulo-do-artigo',
    criadoEm: '2024-06-27T10:00:00Z',
    atualizadoEm: '2024-06-27T11:00:00Z',
    autor: {
      nome: 'João Silva'
    },
    categorias: [
      { nome: 'Mercado Imobiliário' },
      { nome: 'Investimentos' }
    ]
  };

  it('deve renderizar schema para artigo', () => {
    render(
      <HelmetProvider>
        <BlogSchema tipo="Article" artigo={artigoMock} />
      </HelmetProvider>
    );

    // Verificar se o script do schema foi injetado
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const schema = JSON.parse(scripts[0].innerHTML);

    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe(artigoMock.titulo);
    expect(schema.author.name).toBe(artigoMock.autor.nome);
  });

  it('deve renderizar schema para blog', () => {
    render(
      <HelmetProvider>
        <BlogSchema tipo="Blog" />
      </HelmetProvider>
    );

    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const schema = JSON.parse(scripts[0].innerHTML);

    expect(schema['@type']).toBe('Blog');
    expect(schema.name).toBe('Blog Siqueira Campos Imóveis');
  });
});

describe('CompartilharArtigo', () => {
  const artigoMock = {
    titulo: 'Título do Artigo',
    urlAmigavel: 'titulo-do-artigo',
    autor: {
      nome: 'João Silva',
      avatar: '/avatar.jpg'
    },
    criadoEm: '2024-06-27T10:00:00Z'
  };

  it('deve renderizar botões de compartilhamento', () => {
    render(
      <BrowserRouter>
        <CompartilharArtigo artigo={artigoMock} />
      </BrowserRouter>
    );

    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('deve copiar link ao clicar no botão', async () => {
    render(
      <BrowserRouter>
        <CompartilharArtigo artigo={artigoMock} />
      </BrowserRouter>
    );

    const botaoCopiar = screen.getByText('Copiar Link');
    fireEvent.click(botaoCopiar);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'http://localhost:3000/blog/titulo-do-artigo'
      );
    });
  });

  it('deve mostrar informações do autor', () => {
    render(
      <BrowserRouter>
        <CompartilharArtigo artigo={artigoMock} />
      </BrowserRouter>
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByAltText('João Silva')).toHaveAttribute('src', '/avatar.jpg');
  });
});

describe('ImagemLazyLoad', () => {
  it('deve renderizar placeholder inicialmente', () => {
    render(
      <ImagemLazyLoad
        src="/imagem.jpg"
        alt="Teste"
        placeholderSrc="/placeholder.jpg"
      />
    );

    const placeholder = screen.getByAltText('Teste');
    expect(placeholder).toHaveAttribute('src', '/placeholder.jpg');
  });

  it('deve mostrar spinner de carregamento', () => {
    render(
      <ImagemLazyLoad
        src="/imagem.jpg"
        alt="Teste"
      />
    );

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro para imagem inválida', async () => {
    render(
      <ImagemLazyLoad
        src="/imagem-inexistente.jpg"
        alt="Teste"
      />
    );

    // Simular erro de carregamento
    const imagem = new Image();
    imagem.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar imagem')).toBeInTheDocument();
    });
  });

  it('deve aceitar aspect ratio personalizado', () => {
    render(
      <ImagemLazyLoad
        src="/imagem.jpg"
        alt="Teste"
        aspectRatio="4/3"
      />
    );

    const container = screen.getByTestId('imagem-container');
    expect(container).toHaveStyle({ aspectRatio: '4/3' });
  });
});
