# Tabela do INSS 2026

Site oficial com as tabelas atualizadas do INSS para 2026, incluindo alíquotas de contribuição, faixas salariais e informações previdenciárias.

## 🚀 Tecnologias

- **Framework**: Astro 5
- **Deploy**: Cloudflare Pages
- **CDN de Imagens**: Cloudflare R2
- **Domínio**: tabeladoinss.com.br

## 📁 Estrutura do Projeto

```text
/
├── public/           # Arquivos estáticos
├── src/
│   ├── components/   # Componentes Astro
│   ├── content/
│   │   └── blog/    # Posts do blog (Markdown)
│   ├── layouts/     # Layouts base
│   └── pages/       # Páginas do site
├── scripts/         # Scripts auxiliares
└── AGENTS.md       # Documentação interna
```

## 🛠️ Comandos

| Comando | Ação |
|---------|------|
| `npm install` | Instala as dependências |
| `npm run dev` | Inicia servidor local em `localhost:4321` |
| `npm run build` | Gera build de produção em `./dist/` |
| `npm run preview` | Visualiza o build localmente |

## 📝 Publicação de Posts

Os posts do blog são agendados automaticamente:

1. Crie um arquivo em `src/content/blog/` com frontmatter
2. Defina `pubDate` com data futura (UTC)
3. O GitHub Actions publica diariamente às 07:00 (GMT-3)

Detalhes completos em [AGENTS.md](./AGENTS.md).

## 🚀 Deploy

O site é implantado automaticamente via Cloudflare Pages:

- **Push para master**: Deploy automático
- **Build diário**: 07:00 GMT-3 (para posts agendados)
- **Custom domain**: tabeladoinss.com.br

## 🖼️ Imagens e CDN

Imagens OG são hospedadas no Cloudflare R2:

- **URL base**: `https://img.tabeladoinss.com.br/`
- **Estrutura**: `/og/` (site) e `/blog/og/` (posts)
- **Upload via CLI**: `wrangler r2 object put`

## 📊 Páginas de Tabelas

- Tabela do INSS Empresas
- Tabela Contribuinte Individual
- Tabela de Códigos do INSS
- Tabela de Siglas do INSS
- Tabela de Aposentadoria por Pontos
- Tabela de Regras de Transição
- E mais...

## 🔗 Links Úteis

- [Site em produção](https://tabeladoinss.com.br)
- [Documentação do Astro](https://docs.astro.build)
- [Cloudflare Pages](https://pages.cloudflare.com)