import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const site = 'https://tabeladoinss.com.br';

function campoDoFrontmatter(frontmatter, nome) {
  const achado = frontmatter.match(new RegExp(`^${nome}:\\s*(.+?)\\s*$`, 'm'));
  return achado ? achado[1].replace(/^['"]|['"]$/g, '') : null;
}

// O sitemap saia sem nenhuma tag <lastmod>, entao nao carregava sinal de que
// mudou. A data vem do frontmatter do post: updatedDate quando existe, senao
// pubDate. As URLs seguem o [...slug].astro, que usa o nome do arquivo.
function lastmodPorUrl() {
  const dir = fileURLToPath(new URL('./src/content/blog', import.meta.url));
  const mapa = new Map();

  for (const arquivo of readdirSync(dir)) {
    if (!arquivo.endsWith('.md')) continue;

    const frontmatter = readFileSync(`${dir}/${arquivo}`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;

    const data = campoDoFrontmatter(frontmatter[1], 'updatedDate')
      ?? campoDoFrontmatter(frontmatter[1], 'pubDate');
    if (!data) continue;

    const quando = new Date(data);
    if (Number.isNaN(quando.valueOf())) continue;

    mapa.set(`${site}/blog/${arquivo.replace(/\.md$/, '')}/`, quando.toISOString());
  }

  // O indice do blog muda toda vez que entra um post, entao ele herda a data
  // mais recente da lista.
  const maisRecente = [...mapa.values()].sort().pop();
  if (maisRecente) mapa.set(`${site}/blog/`, maisRecente);

  return mapa;
}

const lastmod = lastmodPorUrl();

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      serialize(item) {
        const quando = lastmod.get(item.url);
        if (quando) item.lastmod = quando;
        return item;
      }
    })
  ],
  build: {
    inlineStylesheets: 'auto',
    format: 'directory'
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild'
    }
  }
});
