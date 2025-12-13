# ==========================================
# GUIA RÁPIDO DE CONFIGURAÇÃO
# ==========================================

## ✅ PASSO 1: Instalar Dependências
Execute no terminal:
npm install

## 🔑 PASSO 2: Configurar Credenciais PagFlex

Crie um arquivo chamado .env na raiz do projeto com o seguinte conteúdo:

PAGFLEX_SECRET_KEY=sua_secret_key_aqui
PAGFLEX_COMPANY_ID=seu_company_id_aqui
PORT=3000
NODE_ENV=development

### Como obter as credenciais:
1. Acesse: https://pagflex.readme.io/reference/
2. Faça login no painel do PagFlex
3. Vá em: Integrações → Chaves de API
4. Copie a SECRET KEY e o COMPANY ID
5. Cole no arquivo .env

## ▶️ PASSO 3: Iniciar o Servidor

# Desenvolvimento (com auto-reload)
npm run dev

# OU em produção
npm start

## 🌐 PASSO 4: Testar

Abra o navegador em: http://localhost:3000

1. Clique no botão "DOE AGORA"
2. Selecione um valor
3. Clique em "CONTINUAR PARA PIX"
4. O QR Code e código PIX devem aparecer

## 🔍 PASSO 5: Verificar Logs

O servidor mostrará logs de:
- ✅ Servidor iniciado
- 📝 PIX sendo gerado
- ✅ PIX gerado com sucesso
- ❌ Erros (se houver)

## 🐛 TROUBLESHOOTING

### Erro: "Variáveis de ambiente obrigatórias"
→ Você não criou o arquivo .env ou as credenciais estão vazias

### Erro 404 ao gerar PIX no frontend
→ O servidor não está rodando. Execute: npm start

### Erro 500 ao gerar PIX
→ Verifique suas credenciais do PagFlex no arquivo .env
→ Verifique os logs do servidor para mais detalhes

### QR Code não aparece
→ Verifique se o PagFlex está retornando o código PIX
→ Veja os logs do servidor para detalhes da resposta

## 📞 PRECISA DE AJUDA?

1. Verifique os logs do terminal onde o servidor está rodando
2. Acesse http://localhost:3000/api/health para verificar se a API está online
3. Consulte a documentação do PagFlex: https://pagflex.readme.io/reference/
