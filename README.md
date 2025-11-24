# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/cabb74b3-e492-44cc-9596-ef2e8c15db3a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cabb74b3-e492-44cc-9596-ef2e8c15db3a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy Automático no Vercel

Este projeto está configurado para deploy automático no Vercel (Project ID: `prj_17JwesA0eAU0J1pQyy5iczmCoJPP`).

#### Opção 1: Conectar via Interface Web (Recomendado)

1. **Conecte seu repositório ao projeto existente:**
   - Acesse [vercel.com](https://vercel.com) e faça login
   - Vá para o seu projeto (ID: `prj_17JwesA0eAU0J1pQyy5iczmCoJPP`)
   - Vá em Settings → Git
   - Conecte seu repositório Git (GitHub, GitLab ou Bitbucket)
   - O Vercel detectará automaticamente as configurações do `vercel.json`

2. **Configure as variáveis de ambiente:**
   - No painel do Vercel, vá em Settings → Environment Variables
   - Adicione as seguintes variáveis (ou verifique se já estão configuradas):
     - `VITE_SUPABASE_URL`: Sua URL do Supabase
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: Sua chave pública do Supabase
   - Certifique-se de adicionar para todos os ambientes (Production, Preview, Development)

3. **Deploy automático:**
   - Após conectar, cada push para a branch principal fará deploy automático
   - Você pode configurar preview deployments para outras branches nas configurações

#### Opção 2: Conectar via Vercel CLI

Se preferir usar a CLI:

```sh
# Instalar Vercel CLI globalmente
npm install -g vercel

# Vincular ao projeto existente
vercel link

# Fazer deploy
vercel --prod
```

O arquivo `vercel.json` já está configurado com as opções corretas para este projeto Vite + React, incluindo:
- Configuração de build para Vite
- Rewrites para React Router (SPA)
- Cache headers otimizados para assets estáticos

### Deploy via Lovable

Alternativamente, você pode abrir [Lovable](https://lovable.dev/projects/cabb74b3-e492-44cc-9596-ef2e8c15db3a) e clicar em Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
