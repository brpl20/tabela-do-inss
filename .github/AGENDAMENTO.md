# Agendamento de posts

## O problema

O blog é estático. `src/pages/blog/index.astro` e `src/pages/blog/[...slug].astro`
filtram os posts por `pubDate <= now`, mas esse `now` é congelado no momento do
**build** — não é avaliado quando o leitor abre a página. O deploy atual
(Cloudflare Pages, integração git) só roda quando alguém dá push.

Resultado: um post com `pubDate` no futuro ficava invisível para sempre, até que
um commit qualquer, por acaso, gerasse um build novo. O agendamento não
funcionava sozinho.

## A correção

`.github/workflows/scheduled-rebuild.yml` dispara um deploy todo dia via
**Deploy Hook** da Cloudflare Pages (a Pages não tem build agendado nativo).
Build novo = `now` novo = os posts cuja data já chegou entram no ar.

Horários: 09:00 UTC (06:00 BRT) e 11:00 UTC (08:00 BRT). A segunda passada
existe porque os posts do repo usam `pubDate: ...T10:00:00.000Z`, que às 09:00
UTC ainda é futuro.

## Passo manual — precisa ser feito no painel (uma vez)

1. **Cloudflare**: Dashboard → Workers & Pages → projeto do `tabeladoinss` →
   Settings → Builds & deployments → **Deploy hooks** → Add deploy hook.
   - Nome: `rebuild-agendado`
   - Branch: `master`
   - Copie a URL gerada (ela é um segredo: quem tiver a URL dispara deploys).
2. **GitHub**: repo → Settings → Secrets and variables → Actions → New
   repository secret.
   - Name: `CLOUDFLARE_DEPLOY_HOOK`
   - Value: a URL do passo 1.
3. Teste: aba Actions → "Rebuild agendado" → Run workflow. Deve terminar verde e
   aparecer um deploy novo na Cloudflare.

Enquanto o secret não existir, o workflow **falha de propósito**, com a mensagem
apontando para este arquivo. Falha visível é melhor do que post agendado que
nunca sai.

## Como agendar um post

1. Crie `src/content/blog/<slug>.md` com `title`, `description`, `pubDate`,
   `tags` e `published`.
2. Ponha `pubDate` na data futura desejada, em UTC. Prefira
   `T10:00:00.000Z` (07:00 BRT), que é a convenção do repo e é coberta pela
   passada das 11:00 UTC.
3. Commit e push. O post fica fora do ar até o primeiro rebuild agendado após a
   `pubDate`.

## Histórico

Até janeiro de 2026 o site era publicado no GitHub Pages por um workflow
`publish.yml` com cron diário às 10:00 UTC — era ele que fazia o agendamento
funcionar. O deploy migrou para a Cloudflare Pages e o workflow foi removido; o
cron sumiu junto, mas o filtro `pubDate <= now` continuou no código. Este
workflow recoloca a peça que faltava.
