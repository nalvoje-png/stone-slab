# Stone Slab · v1.1.1

A rede social da indústria mundial de rochas ornamentais.

## Stack
React + TypeScript + Vite + Tailwind + shadcn/ui + Supabase + react-i18next

## Rodando localmente
1. `npm install`
2. Copie `.env.example` para `.env` e preencha com suas chaves do Supabase
3. No Supabase, abra o SQL Editor e rode `supabase/schema.sql`
4. `npm run dev`

## O que já está pronto (esta entrega)
- Design System (azul Sodalita, Inter + Fraunces, tokens)
- i18n PT + EN desde o início
- Cadastro em 2 passos (tipo de conta → dados) com 8 tipos de conta
- Login
- Criação automática do perfil no signup (trigger no Postgres)
- RLS configurado
- Rota protegida + sessão persistente

## Próximas entregas
Feed + PostCard · Páginas das Pedras · Perfil · Explorar · Notificações
