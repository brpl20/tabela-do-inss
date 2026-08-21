# Agendamento de posts — como funciona

O blog é estático (Astro) e as páginas filtram `pubDate <= now`. Esse `now` é o
instante do **build**, não o da visita: sem um build novo, post com data futura
nunca aparece. O workflow `.github/workflows/scheduled-rebuild.yml` dispara um
deploy duas vezes por dia (06:00 e 08:00 BRT) e é isso que libera os posts.

## Configuração (uma vez)

Dois secrets em **Settings → Secrets and variables → Actions**:

| Secret | Valor |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token da Cloudflare com permissão **Account → Cloudflare Pages → Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | `bf37a8c9cc1728597f782f507eeff866` |

O token é o mesmo que já existe no `.env` do content-workspace
(`CLOUDFLARE_TOKEN`) — testado em 21/08/2026, dispara deploy com sucesso.

Não é preciso criar Deploy Hook no painel: a API faz o mesmo e o token é
reaproveitável.

## Testar

Actions → **Rebuild agendado** → *Run workflow*. Deve ficar verde e imprimir o
id do deployment. Confira em Workers & Pages → tabela-do-inss → Deployments.

## Publicar um post agendado

Basta commitar com `pubDate` no futuro. O post fica invisível até a data e
entra sozinho no primeiro rebuild depois dela.

## Custo

Dois deploys por dia ≈ 60 builds/mês, além dos builds de push. Confira a cota
do plano da Cloudflare Pages se ela estiver apertada.
