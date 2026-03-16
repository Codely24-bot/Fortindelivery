# Sistema de Delivery + WhatsApp

Sistema mobile-first para distribuidora de bebidas com:

- loja online para clientes
- painel administrativo em tempo real
- automacao de mensagens no WhatsApp com `whatsapp-web.js`

## Como rodar

1. Instale dependencias:

```bash
npm install
```

2. Rode o sistema:

```bash
npm run dev
```

3. Acesse:

- loja: `http://localhost:5173`
- API: `http://localhost:4000`
- admin: `http://localhost:5173/admin`
- QR do WhatsApp: `http://localhost:4000/api/whatsapp/qr`

## Login admin

- o painel usa Supabase Auth (email + senha)
- e necessario confirmar o email antes do acesso

## Variaveis uteis

- `PORT=4000`
- `PUBLIC_STORE_URL=http://localhost:5173`
- `SUPABASE_URL=https://<project-id>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=chave_service_role`
- `SUPABASE_PROJECT_ID=<project-id>` (opcional, usado se `SUPABASE_URL` nao estiver definido)
- `VITE_SUPABASE_URL=https://<project-id>.supabase.co` (front direto)
- `VITE_SUPABASE_ANON_KEY=chave_anon` (front direto)
- `VITE_PUBLIC_STORE_URL=http://localhost:5173` (opcional)
- `WHATSAPP_ENABLED=true`
- `WHATSAPP_CLIENT_ID=delivery-distribuidora`
- `WHATSAPP_HEADLESS=true`
- `PUPPETEER_EXECUTABLE_PATH=/caminho/do/chrome`
- `DATA_DIR=/caminho/para/persistir`
- `WHATSAPP_AUTH_DIR=/caminho/para/persistir/.wwebjs_auth`
- `WHATSAPP_CACHE_DIR=/caminho/para/persistir/.wwebjs_cache`

## Deploy Railway (servico unico)

1. Builder: use Nixpacks (o projeto inclui `nixpacks.toml`).
2. Start command: `npm start` (ou deixe detectar).
3. Gere um dominio publico para o servico.
4. Volume: monte em `/data`.
5. Mantenha apenas `1` replica do servico para nao corromper `db.json` nem a sessao do WhatsApp.
6. Variaveis sugeridas:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `WHATSAPP_ENABLED=true`
   - `WHATSAPP_HEADLESS=true`
   - `DATA_DIR=/data`
   - `WHATSAPP_AUTH_DIR=/data/.wwebjs_auth`
   - `WHATSAPP_CACHE_DIR=/data/.wwebjs_cache`
7. O sistema ja entende automaticamente:
   - `PORT` do Railway
   - `RAILWAY_PUBLIC_DOMAIN` como URL publica, se `PUBLIC_STORE_URL` nao estiver definida
   - `RAILWAY_VOLUME_MOUNT_PATH` como pasta de dados, se `DATA_DIR` nao estiver definida
8. Depois do deploy:
   - abra `/api/whatsapp/qr`
   - escaneie o QR
   - teste `/api/health`, a loja `/` e o painel `/admin`

## Fluxo do WhatsApp

- o bot recebe mensagens do cliente
- responde com menu, link da loja, bairros, taxa e horario
- consulta o ultimo pedido do numero que entrou em contato
- envia automaticamente updates quando o status do pedido muda
- envia as notificacoes de pedido para o numero real do cliente via WhatsApp Web
- resolve o chat do destinatario antes do envio para melhorar a compatibilidade com numeros reais

## Integracao ativa no sistema

- novo pedido: o cliente recebe a mensagem de `Pedido recebido`
- atualizacao no painel: cada troca de status dispara a mensagem correspondente
- consulta por mensagem: o cliente pode pedir o status do ultimo pedido pelo proprio WhatsApp
- painel e loja continuam respondendo mesmo se o envio do WhatsApp atrasar ou falhar

## Observacoes

- com Supabase configurado, os dados ficam na tabela `app_state`
- sem Supabase, os dados continuam em `server/data/db.json`
- a sessao do WhatsApp fica em `.wwebjs_auth`
- o cache do WhatsApp Web fica em `.wwebjs_cache`
- para deploy com Chrome headless, o projeto inclui `nixpacks.toml`
- se quiser desligar o bot sem remover a integracao, use `WHATSAPP_ENABLED=false`

## Supabase

1. Crie o schema executando `supabase/schema.sql`.
2. Defina `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Migre os dados locais:

```bash
node scripts/migrate-supabase.js
```

Se quiser sobrescrever dados existentes:

```bash
MIGRATE_FORCE=true node scripts/migrate-supabase.js
```

Para o front consumir direto do Supabase:

- defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- o front usa o Supabase para carregar `settings`, `products` e `promotions`
- o checkout usa a funcao SQL `create_order` (RPC) para criar pedidos direto no banco
- o login admin pode usar Supabase Auth (email/senha + confirmacao por email)

Cadastro admin:

- acesse `/admin/cadastro`
- preencha os dados e confirme o email
- depois, use o email e senha no `/admin`
- para editar os dados, acesse `/admin/conta`

RPCs admin (somente server-side):

- o schema inclui funcoes `admin_*` para produtos, promocoes, despesas, motoboys, taxas e status de pedido
- por seguranca, essas funcoes nao sao executaveis com `anon`/`authenticated`
- use o backend (service role) para chamar essas RPCs quando quiser substituir o acesso direto ao banco
