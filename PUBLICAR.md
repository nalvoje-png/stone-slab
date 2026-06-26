# Stone Slab — v1.1.1 · Guia de Publicação

Primeira etapa: Design System completo, biblioteca de componentes, autenticação (cadastro + login) e navegação. Marca oficial aplicada (logo + cores extraídas dele).

A versão aparece no rodapé da sidebar (desktop) e no topo da Home — mesma lógica do Stone NFe para confirmar deploys. **Regra: a cada entrega, sobe o patch (1.1.1 → 1.1.2 → 1.1.3...).**

---

## Passo 1 — Criar o projeto no Supabase

1. Acesse https://supabase.com e crie um novo projeto (ex.: `stone-slab`).
2. Guarde a senha do banco que você definir.
3. Quando o projeto subir, vá em **Project Settings → API** e copie:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key**

## Passo 2 — Rodar o schema do banco

1. No painel do Supabase, abra **SQL Editor → New query**.
2. Cole todo o conteúdo do arquivo `supabase/schema.sql` (vem no projeto).
3. Clique em **Run**. Isso cria a tabela `profiles`, o tipo de conta, o trigger que cria o perfil automaticamente no cadastro e as políticas de RLS.

## Passo 3 — Configurar o e-mail de confirmação (opcional para teste)

Para testar rápido sem confirmar e-mail toda vez:
- Vá em **Authentication → Providers → Email** e, se quiser, desligue temporariamente **"Confirm email"**. (Em produção, deixe ligado.)

---

## Passo 4 — Rodar localmente (sua máquina, `C:\projetos\`)

```bash
cd C:\projetos
# descompacte o stone-slab.zip aqui, depois:
cd stone-slab

# 1. variáveis de ambiente
copy .env.example .env
# abra o .env e preencha:
#   VITE_SUPABASE_URL=...     (Project URL do passo 1)
#   VITE_SUPABASE_ANON_KEY=...(anon public key do passo 1)

# 2. instalar dependências
npm install

# 3. rodar
npm run dev
```

Abra o endereço que aparecer (geralmente `http://localhost:5173`).
Você verá a tela de Login. Crie uma conta em "Criar agora" e teste o fluxo.

---

## Passo 5 — Subir para o GitHub

```bash
cd C:\projetos\stone-slab
git init
git add .
git commit -m "feat: v1.1.1 - design system, auth e navegacao"
git branch -M main
git remote add origin https://github.com/nalvoje-png/stone-slab.git
git push -u origin main
```

(Crie o repositório `stone-slab` vazio no GitHub antes, sem README.)

---

## Passo 6 — Deploy na Vercel

1. Acesse https://vercel.com → **Add New → Project**.
2. Importe o repositório `stone-slab`.
3. A Vercel detecta Vite automaticamente. Confirme:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Em **Environment Variables**, adicione as duas mesmas do `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**.

### Importante — roteamento SPA na Vercel
O projeto já inclui um `vercel.json` que redireciona todas as rotas para o `index.html` (evita erro 404 ao recarregar páginas internas, como acontecia no Stone Block).

---

## Passo 7 — Confirmar o deploy

Abra a URL da Vercel, faça login e confira:
- O **v1.1.1** no rodapé da barra lateral (desktop) ou no topo da Home.
- O logo oficial no canto.

Na próxima entrega o número sobe para **1.1.2**.

---

## O que tem nesta versão

- Design System completo (cores do logo, tipografia Fraunces + Inter, espaçamento, sombras, bordas — tudo em tokens).
- Biblioteca de componentes: Button, Input, Avatar, Badge, Selo de Disponibilidade, Chip, Card, Skeleton, EmptyState.
- Navegação separada por dispositivo: Sidebar (desktop) e Bottom Navigation (mobile).
- Cadastro em 2 passos (8 tipos de conta) + Login, com criação automática de perfil.
- i18n PT + EN desde o início.
- Logo e favicon oficiais.

## Próxima etapa (1.1.2)
Feed + PostCard — a tela onde a foto da pedra vira protagonista.
