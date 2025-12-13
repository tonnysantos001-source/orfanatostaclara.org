const QRCode = require('qrcode');

/**
 * Gera um QR Code SVG a partir de um código PIX
 * @param {string} pixCode - Código PIX copia e cola
 * @returns {Promise<string>} SVG do QR Code
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
        throw error;
    }
}

/**
 * Formata valor em centavos para moeda brasileira
 * @param {number} cents - Valor em centavos
 * @returns {string} Valor formatado (ex: "R$ 100,00")
 */
function formatCurrency(cents) {
    const reais = cents / 100;
    return reais.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Valida se o valor da doação está dentro dos limites
 * @param {number} amountCents - Valor em centavos
 * @returns {object} Resultado da validação
 */
function validateDonationAmount(amountCents) {
    const MIN_DONATION = 100; // R$ 1,00
    const MAX_DONATION = 1000000; // R$ 10.000,00

    if (!amountCents || typeof amountCents !== 'number') {
        return {
            valid: false,
            error: 'Valor inválido'
        };
    }

    if (amountCents < MIN_DONATION) {
        return {
            valid: false,
            error: `Valor mínimo é ${formatCurrency(MIN_DONATION)}`
        };
    }

    if (amountCents > MAX_DONATION) {
        return {
            valid: false,
            error: `Valor máximo é ${formatCurrency(MAX_DONATION)}`
        };
    }

    return { valid: true };
}

module.exports = {
    generateQRCodeSVG,
    formatCurrency,
    validateDonationAmount
};
