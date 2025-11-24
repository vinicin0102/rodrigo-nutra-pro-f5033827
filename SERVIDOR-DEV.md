# 🚀 Servidor de Desenvolvimento

## ✅ Servidor Iniciado!

O servidor de desenvolvimento está rodando e você pode ver todas as alterações em **tempo real**!

## 🌐 Acesse a aplicação:

**URL Local:** http://localhost:8080

## ✨ Recursos Disponíveis:

- 🔄 **Hot Module Replacement (HMR)** - Alterações são recarregadas automaticamente
- ⚡ **Vite Dev Server** - Servidor ultra-rápido de desenvolvimento
- 🎯 **Live Reload** - Página atualiza automaticamente quando você salva arquivos

## 📝 Como funciona:

1. **Edite qualquer arquivo** no diretório `src/`
2. **Salve o arquivo** (Ctrl+S ou Cmd+S)
3. **Veja as mudanças instantaneamente** no navegador!

## 🛑 Como parar o servidor:

Se você iniciou o servidor manualmente:
- Pressione **Ctrl+C** no terminal onde está rodando

Se estiver rodando em background:
```bash
# Encontrar o processo
lsof -ti:8080

# Parar o servidor
kill $(lsof -ti:8080)
```

## 🔄 Como reiniciar:

### Opção 1: Usar o script (Recomendado)
```bash
./start-dev.sh
```

### Opção 2: Comando direto
```bash
export PATH="/Users/viniciusornelas/.nvm/versions/node/v24.9.0/bin:$PATH"
npm run dev
```

## ⚙️ Configuração do Servidor:

O servidor está configurado no `vite.config.ts`:
- **Porta:** 8080
- **Host:** `::` (acessível de todas as interfaces)
- **Modo:** Desenvolvimento (com HMR ativado)

## 🐛 Solução de Problemas:

### Porta 8080 já está em uso?
O Vite tentará usar outra porta automaticamente. Verifique no terminal qual porta foi atribuída.

### Servidor não inicia?
1. Verifique se Node.js está instalado: `node --version`
2. Instale as dependências: `npm install`
3. Verifique se há erros no terminal

### Alterações não aparecem?
1. Limpe o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
2. Verifique o console do navegador para erros
3. Verifique o terminal para erros de build

## 📦 Comandos Úteis:

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção (para testar antes do deploy)
npm run build

# Preview do build de produção
npm run preview

# Instalar novas dependências
npm install nome-do-pacote
```

## 🎉 Pronto para Desenvolver!

Agora você pode editar os arquivos e ver as mudanças instantaneamente no navegador em **http://localhost:8080**

