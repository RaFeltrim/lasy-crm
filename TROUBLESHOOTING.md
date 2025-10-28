# Solução para Tela Preta no Login

## Problema Identificado

O projeto está mostrando uma tela preta em vez da tela de login devido a dois problemas principais:

### 1. Chave do Supabase Incorreta
Você está usando a chave `service_role` em vez da chave `anon` no arquivo `.env.local`.

### 2. Ordem de Redirecionamento no Middleware
O middleware estava tentando redirecionar para `/dashboard` antes de verificar a autenticação.

## Soluções Aplicadas

### ✅ Correção 1: Middleware Ajustado
O arquivo `middleware.ts` foi corrigido para:
1. Primeiro verificar se a rota é pública (`/login`)
2. Depois verificar a autenticação
3. Só então redirecionar `/` para `/dashboard` se o usuário estiver autenticado

### ⚠️ Correção 2: Chave do Supabase (AÇÃO NECESSÁRIA)

**Você precisa atualizar a chave do Supabase no arquivo `.env.local`:**

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard/project/qxbgltpxqhuhzyjfbcdp/settings/api

2. Copie a chave **"anon public"** (NÃO use a "service_role")

3. Substitua no arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

## Passos para Testar

1. **Atualize a chave do Supabase** conforme instruções acima

2. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Limpe o cache do navegador:**
   - Pressione `Ctrl + Shift + Delete` (Windows)
   - Ou abra uma janela anônima/privada

4. **Acesse:** http://localhost:3000

5. **Resultado esperado:**
   - Você deve ser redirecionado automaticamente para `/login`
   - A tela de login deve aparecer com fundo escuro e formulário centralizado

## Verificação Adicional

Se ainda houver problemas, verifique:

1. **Console do navegador** (F12) para erros JavaScript
2. **Terminal** onde o Next.js está rodando para erros de servidor
3. **Conexão com Supabase**: Teste se a URL está acessível

## Criando um Usuário

Você tem duas opções para criar um usuário:

### Opção 1: Usar a página de registro (Recomendado)
1. Acesse: http://localhost:3000/register
2. Preencha email e senha
3. Clique em "Sign Up"
4. Verifique seu email para confirmar a conta (se a confirmação por email estiver habilitada)

### Opção 2: Criar manualmente no Supabase
1. Acesse: https://supabase.com/dashboard/project/qxbgltpxqhuhzyjfbcdp/auth/users
2. Clique em "Add user" → "Create new user"
3. Adicione email e senha
4. Use essas credenciais para fazer login

## Contato

Se o problema persistir após seguir estes passos, forneça:
- Screenshot do console do navegador (F12)
- Logs do terminal do Next.js
- Mensagem de erro específica (se houver)
