/**
 * Serverless Function - POST /api/webhook
 * Recebe notificações de mudança de status do PagFlex
 */
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            ok: false,
            error: 'Método não permitido'
        });
    }

    try {
        const webhookData = req.body;

        console.log('[PagFlex Webhook] ========================================');
        console.log('[PagFlex Webhook] Evento recebido:', webhookData.type);
        console.log('[PagFlex Webhook] Transaction ID:', webhookData.objectId);
        console.log('[PagFlex Webhook] Status:', webhookData.data?.status);
        console.log('[PagFlex Webhook] Payload completo:', JSON.stringify(webhookData, null, 2));
        console.log('[PagFlex Webhook] ========================================');

        // Extrair dados importantes
        const transactionId = webhookData.objectId;
        const status = webhookData.data?.status;
        const amount = webhookData.data?.amount;
        const customerName = webhookData.data?.customer?.name;
        const customerEmail = webhookData.data?.customer?.email;

        // Processar baseado no status
        switch (status) {
            case 'paid':
                console.log(`✅ [Webhook] Pagamento confirmado! ID: ${transactionId}, Valor: R$ ${amount / 100}`);
                // TODO: Aqui você pode:
                // - Enviar email de confirmação
                // - Atualizar banco de dados
                // - Gerar recibo
                break;

            case 'refused':
                console.log(`❌ [Webhook] Pagamento recusado! ID: ${transactionId}`);
                break;

            case 'canceled':
                console.log(`🚫 [Webhook] Pagamento cancelado! ID: ${transactionId}`);
                break;

            case 'refunded':
                console.log(`↩️  [Webhook] Pagamento estornado! ID: ${transactionId}`);
                break;

            case 'expired':
                console.log(`⏰ [Webhook] Pagamento expirado! ID: ${transactionId}`);
                break;

            case 'waiting_payment':
                console.log(`⏳ [Webhook] Aguardando pagamento! ID: ${transactionId}`);
                break;

            default:
                console.log(`ℹ️  [Webhook] Status: ${status}, ID: ${transactionId}`);
        }

        // IMPORTANTE: Responder com 200 rapidamente (dentro de 5 segundos)
        return res.status(200).json({
            ok: true,
            received: true,
            transactionId: transactionId,
            status: status
        });

    } catch (error) {
        console.error('[PagFlex Webhook] Erro ao processar webhook:', error);

        // Mesmo com erro, retornar 200 para não ficar reprocessando
        return res.status(200).json({
            ok: false,
            error: 'Erro ao processar webhook',
            received: true
        });
    }
};
