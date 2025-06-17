# Documentação do Backend - Siqueira Campos Imóveis

Este documento consolida as principais implementações do backend, incluindo autenticação, envio de emails, geração de PDFs, logging e proteções de segurança. Também inclui sugestões de melhorias incrementais para manutenção e segurança.

---

## 1. Autenticação

### Google OAuth 2.0

- Implementado no arquivo `controllers/authController.js`.
- Utiliza a biblioteca `googleapis` para autenticação via OAuth 2.0.
- O fluxo inclui:
  - Redirecionamento para consentimento Google.
  - Recebimento do código de autorização.
  - Troca do código por tokens de acesso e refresh.
  - Criação ou atualização do usuário no banco de dados.
- Tokens são armazenados e usados para autenticação nas requisições subsequentes.
- Middleware `authMiddleware.js` protege rotas autenticadas.

### Melhorias sugeridas

- Implementar refresh automático do token quando expirar.
- Adicionar logs detalhados para falhas de autenticação.
- Implementar logout seguro invalidando tokens.

---

## 2. Envio de Emails (SMTP com Gmail OAuth2)

- Serviço implementado em `services/emailService.js`.
- Utiliza `nodemailer` com OAuth2 para autenticação segura no Gmail.
- Templates de email são usados para mensagens padronizadas.
- Suporta envio de emails para confirmações, notificações e redefinição de senha.

### Melhorias sugeridas

- Adicionar suporte a templates dinâmicos com handlebars ou similar.
- Implementar fila de envio para evitar bloqueios em picos de envio.
- Monitorar falhas e implementar retry automático.

---

## 3. Geração de PDF

- Serviço implementado em `services/pdfService.js`.
- Utiliza `pdfkit` para criação dinâmica de documentos PDF.
- Usado para gerar documentos como contratos, relatórios e recibos.
- Suporta customização de layout, fontes e imagens.

### Melhorias sugeridas

- Adicionar suporte a geração assíncrona com filas.
- Implementar cache para documentos gerados frequentemente.
- Validar dados de entrada para evitar erros na geração.

---

## 4. Logging de Atividades

- Middleware principal em `middlewares/loggerMiddleware.js`.
- Utiliza `winston` para logging estruturado.
- Logs são salvos em arquivos (`error.log` e `combined.log`) e no banco de dados para rotas críticas e erros.
- Dados sensíveis são mascarados automaticamente.
- Logs incluem informações de requisição, resposta, duração e usuário.
- Também possui logging para requisições lentas e erros não tratados.

### Melhorias sugeridas

- Centralizar logs em serviço externo (ex: ELK, Datadog).
- Adicionar alertas para erros críticos.
- Melhorar rastreamento de requisições com IDs correlacionados.

---

## 5. Proteções de Segurança

- Configuração consolidada em `middlewares/securityMiddleware.js`.
- Utiliza:
  - `helmet` para cabeçalhos HTTP seguros e Content Security Policy (CSP).
  - `cors` configurado para permitir apenas origens confiáveis.
  - `xss-clean` para sanitização contra XSS.
  - `hpp` para proteção contra HTTP Parameter Pollution.
  - Rate limiters para login, criação de conta, reset de senha e API geral.
  - Middleware para blacklist de tokens JWT.
  - Validação de origem e content-type.
  - Proteção contra timing attacks com delays aleatórios.
  - Validação de tamanho máximo do payload.
  - Logging de segurança no banco de dados.
- Middleware combinado `securityMiddleware` aplica todas as proteções.

### Melhorias sugeridas

- Implementar CSRF tokens para rotas sensíveis.
- Revisar e ajustar políticas CSP conforme necessidade.
- Monitorar e bloquear IPs maliciosos automaticamente.
- Adicionar testes automatizados para segurança.

---

## 6. Considerações Gerais

- O backend utiliza Prisma ORM para acesso ao banco de dados.
- Testes unitários e de integração estão presentes em `backend/tests`.
- Scripts para deploy, backup e monitoramento estão em `backend/scripts`.
- Configurações sensíveis são gerenciadas via variáveis de ambiente.

---

## 7. Próximos Passos

- Criar documentação para frontend e integração com backend.
- Automatizar deploy com CI/CD.
- Implementar monitoramento e alertas em produção.
- Revisar periodicamente dependências para vulnerabilidades.

---

Esta documentação será mantida atualizada conforme o projeto evolui.

---

**Fim da Documentação**
