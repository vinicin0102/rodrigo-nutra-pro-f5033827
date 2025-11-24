# 🚀 Como Fazer Deploy de Teste - Resumo Rápido

## ✅ Tudo está configurado!

O projeto está pronto para deploy no Vercel. Escolha uma das opções abaixo:

---

## 📋 Opção 1: Via Interface Web do Vercel (MAIS FÁCIL)

### Passo a Passo:

1. **Acesse seu projeto no Vercel:**
   - Vá para: https://vercel.com
   - Faça login
   - Procure o projeto com ID: `prj_17JwesA0eAU0J1pQyy5iczmCoJPP`

2. **Configure as Variáveis de Ambiente** (se ainda não configurou):
   - Vá em **Settings** → **Environment Variables**
   - Adicione:
     - `VITE_SUPABASE_URL` = sua URL do Supabase
     - `VITE_SUPABASE_PUBLISHABLE_KEY` = sua chave do Supabase
   - Marque para Production, Preview e Development

3. **Conecte o Repositório Git** (se ainda não conectou):
   - Vá em **Settings** → **Git**
   - Clique em **Connect Git Repository**
   - Selecione seu repositório

4. **Faça o Deploy:**
   - Vá em **Deployments**
   - Clique em **Create Deployment** ou **Redeploy**
   - Selecione a branch e clique em **Deploy**

📖 **Guia completo**: Veja `DEPLOY-WEB.md` para instruções detalhadas

---

## 💻 Opção 2: Via Terminal (Requer Node.js)

### Se você tem Node.js instalado:

```bash
# Execute o script de deploy
./deploy-test.sh

# OU use npm diretamente
npm install
npm run build
npx vercel
```

📖 **Guia completo**: Veja `DEPLOY.md` para instruções detalhadas

---

## 🔄 Opção 3: Deploy Automático via Git

Se você já conectou o repositório ao Vercel:

```bash
# Faça commit e push
git add .
git commit -m "Preparar para deploy"
git push origin main

# O Vercel fará deploy automático! 🎉
```

---

## ⚙️ Configurações já prontas:

✅ **vercel.json** - Configurado com:
  - Build command: `npm run build`
  - Output directory: `dist`
  - Framework: Vite
  - Rewrites para React Router (SPA)
  - Cache headers otimizados

✅ **Project ID** - Vinculado: `prj_17JwesA0eAU0J1pQyy5iczmCoJPP`

✅ **Scripts NPM** adicionados:
  - `npm run deploy` - Deploy de produção
  - `npm run deploy:test` - Deploy de teste

---

## 🎯 Qual opção escolher?

- **Novo no Vercel?** → Use a **Opção 1** (Interface Web)
- **Já tem Node.js instalado?** → Use a **Opção 2** (Terminal)
- **Já conectou o Git?** → Use a **Opção 3** (Push automático)

---

## ❓ Problemas?

Verifique os guias detalhados:
- `DEPLOY-WEB.md` - Deploy via interface web
- `DEPLOY.md` - Deploy via terminal/CLI


