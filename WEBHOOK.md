# 📡 Webhook PagFlex - Orfanato Santa Clara

## 🎯 Visão Geral

O webhook recebe notificações automáticas do PagFlex quando o status de uma transação muda (pago, cancelado, expirado, etc.).

## 🔗 URL do Webhook

```
https://orfanatostaclara.vercel.app/api/webhook
```

## 📋 Eventos Recebidos

### Status Possíveis

| Status | Descrição | Ação Automática |
|--------|-----------|----------------|
| `waiting_payment` | Aguardando pagamento | Log de criação |
| `paid` | ✅ Pagamento confirmado | Log + (TODO: Email, DB) |
| `refused` | ❌ Recusado | Log de recusa |
| `canceled` | 🚫 Cancelado | Log de cancelamento |
| `refunded` | ↩️ Estornado | Log de estorno |
| `expired` | ⏰ Expirado | Log de expiração |
| `chargedback` | Chargeback | Log de contestação |
| `failed` | Falha | Log de falha |

## 📊 Estrutura do Payload

```json
{
    "id": "F92XRTVSGB2B",
    "type": "transaction",
    "objectId": "28a65292-6c74-4368-924d-f52a653706be",
    "data": {
        "id": "28a65292-6c74-4368-924d-f52a653706be",
        "amount": 10000,
        "status": "paid",
        "paymentMethod": "PIX",
        "customer": {
            "name": "Fone Techplus",
            "email": "contato@fonetechplus.com"
        },
        "pix": {
            "qrcode": "00020101021226...",
            "expirationDate": "2025-04-03T16:19:43-03:00"
        }
    }
}
```

## 🔍 Ver Logs do Webhook

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto `orfanatostaclara`
3. Vá em **"Functions"** → **`api/webhook`**
4. Veja os logs em tempo real

## 🧪 Testar Webhook Localmente

Para testar o webhook durante desenvolvimento:

1. Instale o **Vercel CLI**: `npm i -g vercel`
2. Execute: `vercel dev`
3. Use **ngrok** para expor o servidor local:
   ```bash
   ngrok http 3000
   ```
4. URL do webhook será: `https://xxxxx.ngrok.io/api/webhook`

## 📝 Próximos Passos (TODO)

Quando o status for `paid`, você pode:

- [ ] **Enviar email de confirmação** para o doador
- [ ] **Salvar em banco de dados** (Supabase, MongoDB, etc.)
- [ ] **Gerar recibo em PDF**
- [ ] **Enviar notificação no WhatsApp** (via Twilio)
- [ ] **Atualizar dashboard de doações**

## ⚙️ Implementar Ações Automáticas

Edite o arquivo `api/webhook.js` na seção:

```javascript
case 'paid':
    console.log(`✅ Pagamento confirmado!`);
    // TODO: Adicione suas ações aqui
    // await sendEmailConfirmation(customerEmail);
    // await saveToDatabase(webhookData);
    // await generateReceipt(transactionId);
    break;
```

## 🔒 Segurança

- ✅ O webhook responde com **200 OK** em até 5 segundos
- ✅ Implementado de forma **idempotente** (pode receber o mesmo evento múltiplas vezes)
- ✅ Todos os eventos são **logados**
- ✅ Falhas não impedem o retorno 200 (evita reprocessamento)

## 📞 Suporte

- **Documentação PagFlex**: https://pagflex.readme.io/
- **Logs Vercel**: https://vercel.com/dashboard
