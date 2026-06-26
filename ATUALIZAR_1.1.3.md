# Stone Slab — v1.1.3 · Atualização (Feed + Criar Publicação)

Esta etapa adiciona o **Feed** com o **PostCard** (foto protagonista, curtir e salvar funcionando de verdade), o **modal de criar publicação** (com upload de foto), scroll infinito, e dados de exemplo (pedras populares já cadastradas).

## ⚠️ Importante: esta versão mexe no banco de dados

Diferente da 1.1.2, aqui você **precisa rodar um novo SQL** no Supabase antes de usar.

### Passo 1 — Rodar o SQL do Feed
1. No Supabase, abra **SQL Editor → New query**.
2. Cole **todo** o conteúdo do arquivo `supabase/schema_feed.sql` (vem no projeto).
3. Clique em **Run**. Isso cria as tabelas de posts, mídia, pedras, curtidas e salvos; os contadores; o RLS; o bucket de fotos `post-media`; e já insere pedras de exemplo (Patagonia, Taj Mahal, Calacatta, etc.).

> Se aparecer algum erro dizendo que um tipo ou tabela "já existe", me avise — significa que parte já tinha sido criada e a gente ajusta.

### Passo 2 — Atualizar o código
No seu computador, dentro de `C:\projetos\stone-slab`:

```bash
git pull            # se você já versiona; senão, substitua os arquivos pela pasta nova
npm install         # garante dependências
npm run dev         # testar localmente
```

Teste o ciclo completo: clique em **Publicar**, escolha uma foto de pedra, marque o tipo e a disponibilidade, publique. O post deve aparecer no feed, e você consegue **curtir** e **salvar**.

### Passo 3 — Subir para produção
```bash
git add .
git commit -m "feat: v1.1.3 - feed, postcard e criar publicacao"
git push
```
A Vercel faz o deploy automático. Confirme o **v1.1.3** no topo do feed.

---

## Nota sobre a versão 1.1.2
Se você ainda não tinha subido a 1.1.2 (a da tela de proteção contra erros), tudo bem: esta 1.1.3 **já inclui** aquela melhoria. Ao subir a 1.1.3, você ganha as duas coisas de uma vez.

## O que vem nesta versão
- Feed com scroll infinito e skeletons de carregamento.
- PostCard: foto 4:5 protagonista, carregamento progressivo, duplo-clique pra curtir, ações discretas, selo de disponibilidade, tags de pedra e localização.
- Curtir e salvar com resposta instantânea (atualização otimista).
- Modal de criar publicação: upload de foto, legenda, tipo de pedra, disponibilidade, localização.
- Storage configurado (bucket `post-media`) com permissões seguras por usuário.
- 9 pedras de exemplo já cadastradas.

## Próxima etapa (1.1.4)
Tela de Perfil (banner, logo, estatísticas, grid de publicações) ou comentários nos posts — você decide.
