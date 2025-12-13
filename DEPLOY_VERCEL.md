# 🚀 Deploy na Vercel - Guia Completo

## 📋 Pré-requisitos

1. Conta no GitHub (já criada)
2. Conta na Vercel (criar em https://vercel.com)
3. Credenciais do PagFlex

## 🔄 Passo 1: Enviar para o GitHub

```bash
git add .
git commit -m "Integração PagFlex completa"
git push origin main
```

## 🌐 Passo 2: Deploy na Vercel

### Opção A: Via Interface Web (Recomendado)

1. Acesse https://vercel.com
2. Clique em "Add New" → "Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente (veja abaixo)
5. Clique em "Deploy"

### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel
```

## 🔑 Passo 3: Configurar Variáveis de Ambiente na Vercel

**IMPORTANTE**: Adicione essas variáveis no painel da Vercel:

1. No projeto, vá em "Settings" → "Environment Variables"
2. Adicione as seguintes variáveis:

```
Nome: PAGFLEX_SECRET_KEY
Valor: sk_live_X7tjZscTTcMOIOu0QU3P4tVUiwiGdstAGF2g0LtwmD4tG13k

Nome: PAGFLEX_COMPANY_ID
Valor: 23e644fb-c25a-4880-a2e2-136880054a90
```

3. Selecione todos os ambientes (Production, Preview, Development)
4. Clique em "Save"
5. **Redesploy** o projeto para aplicar as variáveis

## ✅ Passo 4: Testar

1. Acesse a URL do seu site na Vercel (ex: `https://seu-site.vercel.app`)
2. Clique em "DOE AGORA"
3. Selecione um valor
4. Clique em "CONTINUAR PARA PIX"
5. O QR Code deve aparecer! 🎉

## 🔍 Verificar se está funcionando

Acesse: `https://seu-site.vercel.app/api/health`

Deve retornar:
```json
{
  "ok": true,
  "service": "Orfanato Santa Clara - API",
  "status": "online",
  "credentials_configured": true,
  "timestamp": "2025-12-13T..."
}
```

## 📁 Estrutura para Vercel

```
├── api/
│   ├── generate.js    # Serverless Function - Gera PIX
│   ├── status.js      # Serverless Function - Consulta status
│   └── health.js      # Serverless Function - Health check
├── img/               # Imagens
├── index.html         # Página principal
├── app.js             # Frontend JavaScript
├── favicon.svg        # Ícone do site
├── package.json       # Dependências
└── vercel.json        # Configuração da Vercel
```

## 🐛 Troubleshooting

### Erro: "Credenciais não configuradas"
→ Verifique se adicionou as variáveis de ambiente na Vercel
→ Redesploy após adicionar as variáveis

### Erro 404 nas APIs
→ Verifique se o arquivo `vercel.json` existe
→ Verifique se a pasta `api/` está no repositório

### QR Code não aparece
→ Veja os logs da Vercel: Settings → Functions → Logs
→ Verifique se o PagFlex está retornando os dados corretamente

## 📝 Logs da Vercel

Para ver logs em tempo real:

1. Acesse o projeto na Vercel
2. Vá em "Deployments" → selecione o último deploy
3. Clique em "Functions" → selecione a função (ex: `api/generate`)
4. Veja os logs em tempo real

## 🔄 Redeploy após mudanças

Sempre que fizer alterações:

```bash
git add .
git commit -m "Suas alterações"
git push
```

A Vercel fará deploy automático!

## 🎯 URLs Importantes

- **Site**: https://seu-site.vercel.app
- **Health Check**: https://seu-site.vercel.app/api/health
- **Painel Vercel**: https://vercel.com/dashboard
- **Docs PagFlex**: https://pagflex.readme.io/reference/

## 🔒 Segurança

- ✅ As credenciais estão seguras nas variáveis de ambiente da Vercel
- ✅ O arquivo `.env` NÃO é commitado (está no `.gitignore`)
- ✅ As APIs têm CORS configurado
- ✅ Validação de valores antes de criar transações

## 💡 Dicas

- Use o ambiente de "Preview" da Vercel para testar antes de enviar para produção
- Configure um domínio customizado em Settings → Domains
- Monitore os logs regularmente para identificar problemas
- O PagFlex tem um painel onde você pode ver todas as transações

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **PagFlex Docs**: https://pagflex.readme.io/reference/
- **Status da API**: Verifique `/api/health`
