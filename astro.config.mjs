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
  const agora = new Date();

  for (const arquivo of readdirSync(dir)) {
    if (!arquivo.endsWith('.md')) continue;

    const frontmatter = readFileSync(`${dir}/${arquivo}`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;

    // O indice so lista posts ja publicados, como getStaticPaths no blog.
    // Um post agendado nao pode adiantar o lastmod do indice.
    const publicadaEm = new Date(campoDoFrontmatter(frontmatter[1], 'pubDate') ?? '');
    if (Number.isNaN(publicadaEm.valueOf()) || publicadaEm > agora) continue;

    const atualizadaEm = new Date(campoDoFrontmatter(frontmatter[1], 'updatedDate') ?? '');
    const quando = !Number.isNaN(atualizadaEm.valueOf())
      && atualizadaEm >= publicadaEm && atualizadaEm <= agora
      ? atualizadaEm
      : publicadaEm;

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
