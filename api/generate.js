const axios = require('axios');
const QRCode = require('qrcode');

// Configurações do PagFlex
const PAGFLEX_API_URL = 'https://api.pagflexbrasil.com/functions/v1';
// Last updated: 2025-12-13T14:17:00 - CONVERTENDO PARA REAIS

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
 * Gera QR Code SVG a partir do código PIX
 */
async function generateQRCodeSVG(pixCode) {
    try {
        const svg = await QRCode.toString(pixCode, {
            type: 'svg',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        return svg;
    } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
        return '';
    }
}

/**
 * Serverless Function - POST /api/generate
 * Gera um novo PIX para doação
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
        const { amount_cents } = req.body;

        // Validar valor
        if (!amount_cents || typeof amount_cents !== 'number') {
            return res.status(400).json({
                ok: false,
                error: 'Valor inválido'
            });
        }

        if (amount_cents < 100) {
            return res.status(400).json({
                ok: false,
                error: 'Valor mínimo é R$ 1,00'
            });
        }

        if (amount_cents > 1000000) {
            return res.status(400).json({
                ok: false,
                error: 'Valor máximo é R$ 10.000,00'
            });
        }

        console.log(`[PagFlex] Gerando PIX de R$ ${(amount_cents / 100).toFixed(2)}...`);
        console.log(`[PagFlex] Amount em centavos: ${amount_cents}`);

        // Criar transação no PagFlex
        const authHeader = getAuthHeader();

        // Formato correto conforme documentação PagFlex
        const requestData = {
            customer: {
                name: "Doador Anônimo",
                email: "doador@orfanatostaclara.org",
                document: "00000000000"
            },
            paymentMethod: "PIX",  // Deve ser maiúsculo
            items: [
                {
                    title: "Doação para Orfanato Santa Clara",
                    unitPrice: amount_cents,  // Em CENTAVOS
                    quantity: 1
                }
            ],
            amount: amount_cents,  // Total em CENTAVOS (obrigatório)
            description: `Doação Orfanato Santa Clara - R$ ${(amount_cents / 100).toFixed(2)}`
        };

        console.log('[PagFlex] Request data:', JSON.stringify(requestData));

        const response = await axios({
            method: 'POST',
            url: `${PAGFLEX_API_URL}/transactions`,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            data: requestData
        });

        const transaction = response.data;
        console.log('[PagFlex] Resposta recebida:', JSON.stringify(transaction).substring(0, 500));

        // Extrair código PIX
        const pixCode = transaction.pix_code ||
            transaction.qr_code ||
            transaction.data?.pix_code ||
            transaction.data?.qr_code ||
            transaction.qr_code_text ||
            transaction.pix?.qr_code ||
            '';

        // Extrair QR Code SVG
        let pixSvg = transaction.qr_code_svg ||
            transaction.data?.qr_code_svg ||
            transaction.pix?.qr_code_svg ||
            '';

        // Se não veio SVG, gerar localmente
        if (!pixSvg && pixCode) {
            console.log('[PagFlex] Gerando QR Code localmente...');
            pixSvg = await generateQRCodeSVG(pixCode);
        }

        // Extrair ID da transação
        const txid = transaction.id ||
            transaction.transaction_id ||
            transaction.txid ||
            transaction.data?.id ||
            `tx_${Date.now()}`;

        console.log(`[PagFlex] ✅ PIX gerado! ID: ${txid}, PIX Code: ${pixCode ? 'OK' : 'MISSING'}`);

        // Retornar resposta
        return res.status(200).json({
            ok: true,
            data: {
                id: txid,
                pixCode: pixCode,
                pixSvg: pixSvg,
                amount_cents,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('[PagFlex] Erro completo:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });

        return res.status(500).json({
            ok: false,
            error: error.response?.data?.message || error.response?.data || error.message || 'Erro ao gerar PIX',
            details: error.response?.data // Retornar detalhes do erro para debug
        });
    }
};
