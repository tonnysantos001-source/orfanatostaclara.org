const axios = require('axios');

// Configurações do PagFlex
const PAGFLEX_API_URL = 'https://api.pagflexbrasil.com/functions/v1';

/**
 * Gera credenciais Base64 para autenticação Basic
 */
function getAuthHeader() {
    const secretKey = process.env.PAGFLEX_SECRET_KEY;
    const companyId = process.env.PAGFLEX_COMPANY_ID;

    if (!secretKey || !companyId) {
        throw new Error('Credenciais do PagFlex não configuradas');
    }

    const credentials = Buffer.from(`${secretKey}:${companyId}`).toString('base64');
    return `Basic ${credentials}`;
}

/**
 * Serverless Function - GET /api/status
 * Consulta o status de uma transação
 */
module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            ok: false,
            error: 'Método não permitido'
        });
    }

    try {
        const { txid } = req.query;

        if (!txid) {
            return res.status(400).json({
                ok: false,
                error: 'ID da transação é obrigatório'
            });
        }

        console.log(`[PagFlex] Consultando status da transação: ${txid}`);

        // Consultar status no PagFlex
        const authHeader = getAuthHeader();

        const response = await axios({
            method: 'GET',
            url: `${PAGFLEX_API_URL}/transactions/${txid}`,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        const transaction = response.data;

        // Extrair status
        const remoteStatus = transaction.status ||
            transaction.state ||
            transaction.payment_status ||
            transaction.data?.status;

        // Normalizar status
        let status = 'pending';
        if (remoteStatus) {
            const statusLower = String(remoteStatus).toLowerCase();
            if (statusLower === 'paid' || statusLower === 'approved' || statusLower === 'success') {
                status = 'paid';
            } else if (statusLower === 'pending' || statusLower === 'waiting') {
                status = 'pending';
            } else if (statusLower === 'failed' || statusLower === 'cancelled' || statusLower === 'expired') {
                status = 'failed';
            }
        }

        console.log(`[PagFlex] Status: ${status}`);

        return res.status(200).json({
            ok: true,
            status: status,
            data: {
                status: status,
                txid: txid
            }
        });

    } catch (error) {
        console.error('[PagFlex] Erro ao consultar status:', error.response?.data || error.message);

        // Se for 404, a transação não existe (ainda)
        if (error.response?.status === 404) {
            return res.status(200).json({
                ok: true,
                status: 'pending',
                data: {
                    status: 'pending',
                    txid: req.query.txid
                }
            });
        }

        return res.status(500).json({
            ok: false,
            error: 'Erro ao consultar status'
        });
    }
};
