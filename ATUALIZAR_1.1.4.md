# Stone Slab — v1.1.4 · Explorar + Páginas das Pedras

Esta etapa adiciona o lado visual de descoberta — o que dá o "uau" de rede social:

- **Explorar**: mosaico irregular estilo Instagram (umas fotos maiores), com chips das pedras no topo e scroll infinito.
- **Páginas das Pedras**: cada pedra (Patagonia, Calacatta...) tem sua própria página, com um hero editorial e o grid de TODAS as publicações daquela pedra, de todas as empresas, agregadas automaticamente. Este é o diferencial do Stone Slab.
- **Índice de Pedras**: a tela /stones com um card bonito para cada pedra.

As pedras de exemplo (Patagonia, Taj Mahal, Calacatta, etc.) já foram cadastradas na 1.1.3, então não há novo SQL obrigatório nesta versão.

## Passo 1 — Atualizar o código
Dentro de `C:\projetos\stone-slab`:
```bash
git pull            # ou substitua os arquivos pela pasta nova
npm install
npm run dev
```

## Passo 2 — Publicar (sem novo SQL)
Não há banco novo a rodar. As telas funcionam com o que já existe.
Para vê-las cheias, publique algumas fotos pelo próprio app (botão Publicar),
escolhendo o **tipo de pedra** em cada publicação — é isso que alimenta o
Explorar e as Páginas das Pedras.

## Passo 3 — Subir para produção
```bash
git add .
git commit -m "feat: v1.1.4 - explorar e paginas das pedras"
git push
```
Confirme o **v1.1.4** no topo do feed.

---

## Onde baixar fotos reais de pedra (grátis, uso comercial)

No Unsplash (https://unsplash.com), as fotos são livres para uso comercial,
sem necessidade de atribuição. Bons termos de busca:

- "marble slab", "granite slab", "quartzite", "marble texture"
- "calacatta marble", "nero marquina", "onyx stone", "stone countertop"

Baixe a foto (botão Download), depois publique pelo app normalmente,
escolhendo o tipo de pedra correspondente. A foto vai para o seu Storage
e aparece no feed, no Explorar e na Página daquela pedra.

Dica: capriche nas primeiras publicações de cada pedra — são elas que vão
formar o mosaico e dar a primeira impressão premium ao abrir o app.

## Próxima etapa sugerida (1.1.5)
Tela de Perfil (banner, logo, estatísticas, grid de publicações da empresa)
ou Seguir empresas + feed personalizado.
