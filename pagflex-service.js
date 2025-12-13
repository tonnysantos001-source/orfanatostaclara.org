const axios = require('axios');

class PagFlexService {
  constructor(secretKey, companyId) {
    this.secretKey = secretKey;
    this.companyId = companyId;
    this.baseURL = 'https://api.pagflexbrasil.com/functions/v1';
    
    // Criar credenciais Base64 para Authorization Basic
    this.credentials = Buffer.from(`${secretKey}:${companyId}`).toString('base64');
  }

  /**
   * Cria uma transação PIX
   * @param {number} amountCents - Valor em centavos (ex: 10000 = R$ 100,00)
   * @param {object} options - Opções adicionais
   * @returns {Promise<object>} Dados da transação criada
   */
  async createPixTransaction(amountCents, options = {}) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseURL}/transactions`,
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json'
        },
        data: {
          amount: amountCents,
          payment_method: 'pix',
          description: options.description || 'Doação Orfanato Santa Clara',
          customer: options.customer || {},
          metadata: options.metadata || {}
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao criar transação PIX:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Consulta o status de uma transação
   * @param {string} transactionId - ID da transação
   * @returns {Promise<object>} Status da transação
   */
  async getTransactionStatus(transactionId) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseURL}/transactions/${transactionId}`,
        headers: {
          'Authorization': `Basic ${this.credentials}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao consultar status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || { message: error.message }
      };
    }
  }

  /**
   * Gera o código PIX copia e cola
   * @param {object} transaction - Dados da transação
   * @returns {string} Código PIX
   */
  extractPixCode(transaction) {
    // O código PIX geralmente vem em transaction.pix_code ou transaction.qr_code
    return transaction.pix_code || 
           transaction.qr_code || 
           transaction.data?.pix_code || 
           transaction.data?.qr_code ||
           '';
  }

  /**
   * Gera SVG do QR Code (se disponível na resposta)
   * @param {object} transaction - Dados da transação
   * @returns {string} SVG do QR Code
   */
  extractQrCodeSvg(transaction) {
    return transaction.qr_code_svg || 
           transaction.data?.qr_code_svg ||
           '';
  }
}

module.exports = PagFlexService;
