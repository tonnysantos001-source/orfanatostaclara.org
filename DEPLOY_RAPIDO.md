# 🚀 COMANDOS RÁPIDOS PARA DEPLOY

## ✅ 1. Commit e Push para GitHub

```bash
git add .
git commit -m "feat: Integração PagFlex completa com Serverless Functions"
git push origin main
```

## 🌐 2. Deploy na Vercel

### Via Web (RECOMENDADO):
1. Acesse: https://vercel.com
2. Clique em "Add New" → "Project"
3. Selecione o repositório: `orfanatostaclara.org`
4. **NÃO CLIQUE EM DEPLOY AINDA!**
5. Clique em "Environment Variables"
6. Adicione:
   ```
   PAGFLEX_SECRET_KEY = sk_live_X7tjZscTTcMOIOu0QU3P4tVUiwiGdstAGF2g0LtwmD4tG13k
   PAGFLEX_COMPANY_ID = 23e644fb-c25a-4880-a2e2-136880054a90
   ```
7. Agora clique em "Deploy"

### Via CLI (ALTERNATIVA):
```bash
npm i -g vercel
vercel login
vercel --prod
```

## 🧪 3. Testar

Após o deploy, acesse:
- **Seu site**: https://seu-projeto.vercel.app
- **Health check**: https://seu-projeto.vercel.app/api/health

No site:
1. Clique em "DOE AGORA"
2. Selecione R$ 100
3. Clique em "CONTINUAR PARA PIX"
4. O QR Code deve aparecer! 🎉

## 📱 4. Testar Pagamento

1. Abra o app do seu banco no celular
2. Vá em PIX → Pagar → QR Code
3. Escaneie o QR Code gerado
4. Confirme o pagamento de teste
5. Aguarde alguns segundos
6. O modal deve mudar para "Pago!" automaticamente

## ⚡ Comandos Git Úteis

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Ver mudanças
git diff

# Desfazer commit (se precisar)
git reset --soft HEAD~1
```

## 🔄 Atualizar após mudanças

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

A Vercel faz redeploy automático! ✨

## 🐛 Se der erro na Vercel

1. Veja os logs: Deploy → Function Logs
2. Verifique se as variáveis de ambiente estão salvas
3. Tente redesploy manual: Deployments → ... → Redeploy

## 📋 Checklist Final

- [ ] Credenciais adicionadas no .env local
- [ ] Código commitado no GitHub
- [ ] Projeto importado na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Deploy realizado
- [ ] Health check respondendo
- [ ] Teste de geração de PIX funcionando
- [ ] Teste de pagamento real funcionando

## 🎉 Pronto!

Seu site está online e aceitando doações via PIX! 🚀
