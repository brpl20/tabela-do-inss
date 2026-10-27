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
3. Um rebuild agendado (GitHub Actions → Deploy Hook da Cloudflare) roda às
   06:00 e 08:00 GMT-3 e coloca no ar os posts cuja data já chegou
   (ver [.github/AGENDAMENTO.md](./.github/AGENDAMENTO.md))

Detalhes completos em [AGENTS.md](./AGENTS.md).

## 🚀 Deploy

O site é implantado automaticamente via Cloudflare Pages:

- **Push para master**: Deploy automático
- **Rebuild diário**: 06:00 e 08:00 GMT-3 (para posts agendados)
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
### Imagem social padrão e validação de build

`public/og-image.jpg` é a exportação JPEG (1200×630, qualidade 85, sem EXIF)
 do template de marca existente `public/og-image-example.svg`, indicado em
`AGENTS.md`. Para atualizar a exportação após uma mudança aprovada no template:

```sh
node --input-type=module -e "import sharp from 'sharp'; await sharp('public/og-image-example.svg').flatten({background:'#ffffff'}).jpeg({quality:85}).toFile('public/og-image.jpg')"
```

`npm run build` também executa `check:social-images` sobre o HTML e os ativos
emitidos em `dist/`. A checagem exige imagem Open Graph/Twitter coincidente,
arquivo local decodificável e dimensões iguais às declaradas. Imagens de outro
host são contadas como não verificadas e precisam de conferência HTTP separada.
Para repetir só essa validação: `npm run check:social-images`.
O build local não comprova deploy: confira o GET da imagem e a metadata das
páginas em produção antes de encerrar uma issue.
