# 🚀 Guia de Deploy de Teste no Vercel

Este guia explica como fazer um deploy de teste para confirmar que tudo está funcionando.

## Pré-requisitos

1. **Node.js instalado** (versão 18 ou superior)
   - Verifique com: `node --version`
   - Instale em: https://nodejs.org/

2. **Conta no Vercel**
   - Crie uma conta em: https://vercel.com

## Opção 1: Deploy Rápido via Script (Recomendado)

Execute o script de deploy:

```bash
./deploy-test.sh
```

O script irá:
- ✅ Verificar se Node.js está instalado
- 📦 Instalar dependências (se necessário)
- 🔨 Fazer build do projeto
- 🚀 Fazer deploy de teste no Vercel

## Opção 2: Deploy Manual via NPM

```bash
# 1. Instalar dependências
npm install

# 2. Fazer build
npm run build

# 3. Deploy de teste (primeira vez pedirá login)
npx vercel

# Ou usar o script do package.json
npm run deploy:test
```

## Opção 3: Deploy via Vercel CLI (Global)

Se você já tem o Vercel CLI instalado globalmente:

```bash
# Login (primeira vez)
vercel login

# Deploy de teste
vercel

# Deploy de produção
vercel --prod
```

## Primeira Execução

Na primeira vez que você executar o deploy, o Vercel irá:

1. **Solicitar login**: Abra o navegador e faça login na sua conta Vercel
2. **Detectar o projeto**: O Vercel detectará o Project ID (`prj_17JwesA0eAU0J1pQyy5iczmCoJPP`)
3. **Perguntar configurações**:
   - Link to existing project? **Yes**
   - Which project? Selecionar o projeto com ID `prj_17JwesA0eAU0J1pQyy5iczmCoJPP`
   - Override settings? **No** (já temos o `vercel.json` configurado)

## Variáveis de Ambiente

⚠️ **IMPORTANTE**: Certifique-se de que as variáveis de ambiente estão configuradas no Vercel:

1. Acesse: https://vercel.com → Seu Projeto → Settings → Environment Variables
2. Adicione:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = sua chave pública do Supabase

Você pode definir variáveis de ambiente durante o deploy também:

```bash
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
```

## O que esperar

Após o deploy, você receberá:

- ✅ **URL de Preview**: Uma URL temporária para testar o deploy
- 📝 **Logs do Build**: Para verificar se tudo foi construído corretamente
- 🔗 **Link permanente**: Após o deploy, você terá uma URL para acessar

## Troubleshooting

### Erro: "Node.js não encontrado"
- Instale o Node.js: https://nodejs.org/
- Ou use nvm: `nvm install node`

### Erro: "Build failed"
- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique os logs de erro no terminal
- Teste o build localmente: `npm run build`

### Erro: "Environment variables missing"
- Configure as variáveis de ambiente no painel do Vercel
- Ou defina durante o deploy usando `npx vercel env add`

### Deploy não está vinculado ao projeto correto
- Execute: `npx vercel link`
- Selecione o projeto com ID: `prj_17JwesA0eAU0J1pQyy5iczmCoJPP`

## Próximos Passos

Após confirmar que o deploy de teste funciona:

1. ✅ Conecte seu repositório Git no Vercel (Settings → Git)
2. ✅ Configure deploy automático
3. ✅ Cada push na branch principal fará deploy automático


