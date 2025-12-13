# Orfanato Santa Clara - Sistema de Doações

Sistema de doações online integrado com PagFlex para geração de pagamentos via PIX.

## 🚀 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` e adicione suas credenciais do PagFlex:
```
PAGFLEX_SECRET_KEY=sua_secret_key_aqui
PAGFLEX_COMPANY_ID=seu_company_id_aqui
```

## 📋 Como obter as credenciais do PagFlex

1. Acesse o painel do PagFlex
2. Navegue até **Integrações → Chaves de API**
3. Copie a **Secret Key** (será usada como `PAGFLEX_SECRET_KEY`)
4. Copie o **Company ID** (será usado como `PAGFLEX_COMPANY_ID`)

## ▶️ Executar

### Modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Modo produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📡 Endpoints da API

### POST /api/generate
Gera um novo PIX para doação

**Request:**
```json
{
  "amount_cents": 10000
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "tx_123456",
    "pixCode": "00020126580014br.gov.bcb.pix...",
    "pixSvg": "<svg>...</svg>",
    "amount_cents": 10000,
    "status": "pending"
  }
}
```

### GET /api/status?txid={id}
Consulta o status de uma transação

**Response:**
```json
{
  "ok": true,
  "status": "paid",
  "data": {
    "status": "paid",
    "txid": "tx_123456",
    "amount_cents": 10000
  }
}
```

### GET /api/health
Health check da API

**Response:**
```json
{
  "ok": true,
  "service": "Orfanato Santa Clara - API",
  "status": "online",
  "timestamp": "2025-12-13T14:00:00.000Z",
  "transactions_count": 5
}
```

## 📁 Estrutura do Projeto

```
├── server.js           # Servidor Express
├── pagflex-service.js  # Integração com PagFlex
├── utils.js            # Utilitários (QR Code, validações)
├── app.js              # Frontend JavaScript
├── index.html          # Página principal
├── package.json        # Dependências
└── .env                # Configurações (não versionar!)
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: Nunca versione o arquivo `.env` com suas credenciais!

- O arquivo `.gitignore` já está configurado para ignorar `.env`
- Use sempre HTTPS em produção
- Mantenha suas credenciais seguras

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Axios** - Cliente HTTP
- **QRCode** - Geração de QR Code
- **PagFlex** - Gateway de pagamento

## 📝 Notas

- As transações são armazenadas em memória (Map). Em produção, use um banco de dados
- O polling do status do pagamento é feito a cada 2.5 segundos no frontend
- Timeout de pagamento: 30 minutos

## 📞 Suporte

Para dúvidas sobre a integração com PagFlex, consulte a documentação oficial:
https://pagflex.readme.io/reference/
