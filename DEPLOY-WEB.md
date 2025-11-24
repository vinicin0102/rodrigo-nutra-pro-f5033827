# 🌐 Deploy de Teste via Interface Web do Vercel

Se você não tem Node.js instalado localmente ou prefere usar a interface web, siga estes passos:

## Passo a Passo

### 1. Preparar o Repositório Git

Primeiro, certifique-se de que seu código está em um repositório Git remoto (GitHub, GitLab ou Bitbucket):

```bash
# Se ainda não fez commit das alterações
git add .
git commit -m "Configuração para deploy no Vercel"
git push
```

### 2. Acessar o Projeto no Vercel

1. Acesse: https://vercel.com
2. Faça login na sua conta
3. Vá para o projeto com ID: `prj_17JwesA0eAU0J1pQyy5iczmCoJPP`

### 3. Conectar o Repositório (Se ainda não estiver conectado)

1. No painel do projeto, vá em **Settings** → **Git**
2. Clique em **Connect Git Repository**
3. Selecione seu provedor (GitHub, GitLab ou Bitbucket)
4. Autorize o Vercel e selecione o repositório
5. Clique em **Connect**

### 4. Configurar Variáveis de Ambiente

1. No painel do projeto, vá em **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:
   - **Name**: `VITE_SUPABASE_URL`
     - **Value**: Sua URL do Supabase
     - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   
   - **Name**: `VITE_SUPABASE_PUBLISHABLE_KEY`
     - **Value**: Sua chave pública do Supabase
     - **Environments**: ✅ Production, ✅ Preview, ✅ Development

3. Clique em **Save** para cada variável

### 5. Fazer Deploy de Teste

**Opção A: Deploy Manual (Recomendado para teste)**

1. No painel do projeto, vá na aba **Deployments**
2. Clique em **Redeploy** no último deployment (se houver)
3. Ou clique em **Create Deployment**
4. Selecione a branch que deseja fazer deploy
5. Clique em **Deploy**

**Opção B: Push para Trigger Deploy Automático**

Se o repositório já estiver conectado:
1. Faça push para a branch principal:
   ```bash
   git push origin main
   ```
2. O Vercel fará deploy automático
3. Você verá o progresso na aba **Deployments**

### 6. Verificar o Deploy

1. Após o deploy iniciar, você verá o progresso em tempo real
2. Quando concluir, você receberá uma URL de preview
3. Clique na URL para testar a aplicação

### 7. Monitorar o Deploy

Na aba **Deployments**, você pode:
- Ver o status do deploy (Building, Ready, Error)
- Ver logs em tempo real
- Acessar a URL de preview
- Ver detalhes do build

## Verificações Importantes

✅ **Build Settings**: Verifique em Settings → General que está configurado:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

✅ **Node Version**: Em Settings → General, certifique-se de usar Node.js 18+

✅ **Root Directory**: Deixe vazio (se o projeto está na raiz)

## Troubleshooting

### Deploy falha no build
- Verifique os logs em tempo real na aba Deployments
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se as variáveis de ambiente estão configuradas

### Variáveis de ambiente não funcionam
- Certifique-se de adicionar para todos os ambientes (Production, Preview, Development)
- Verifique se os nomes das variáveis estão corretos (com `VITE_` prefix)

### URL não funciona após deploy
- Verifique se o `vercel.json` está configurado corretamente
- Certifique-se de que os rewrites estão configurados para React Router

## Próximos Passos

Após confirmar que o deploy de teste funciona:

1. ✅ Configure domínio personalizado (se desejar)
2. ✅ Configure notificações de deploy
3. ✅ Configure preview deployments para branches específicas
4. ✅ Teste o deploy automático fazendo um novo push


