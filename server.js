require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const PagFlexService = require('./pagflex-service');
const { generateQRCodeSVG, validateDonationAmount } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve arquivos estáticos do diretório atual

// Validar variáveis de ambiente
const hasCredentials = process.env.PAGFLEX_SECRET_KEY &&
    process.env.PAGFLEX_COMPANY_ID &&
    process.env.PAGFLEX_SECRET_KEY.trim() !== '' &&
    process.env.PAGFLEX_COMPANY_ID.trim() !== '';

if (!hasCredentials) {
    console.warn('');
    console.warn('⚠️  ═══════════════════════════════════════════════');
    console.warn('⚠️  AVISO: Credenciais do PagFlex NÃO configuradas!');
    console.warn('⚠️  ═══════════════════════════════════════════════');
    console.warn('📝 Edite o arquivo .env e adicione suas credenciais.');
    console.warn('🔑 PAGFLEX_SECRET_KEY e PAGFLEX_COMPANY_ID estão vazios.');
    console.warn('');
    console.warn('🧪 Servidor rodando em MODO DE TESTE');
    console.warn('❌ A API NÃO funcionará até você adicionar as chaves!');
    console.warn('');
}

// Inicializar serviço PagFlex
const pagflex = hasCredentials ? new PagFlexService(
    process.env.PAGFLEX_SECRET_KEY,
    process.env.PAGFLEX_COMPANY_ID
) : null;

// Armazenamento temporário de transações (em produção, use um banco de dados)
const transactions = new Map();

/**
 * POST /api/generate
 * Gera um novo PIX para doação
 */
app.post('/api/generate', async (req, res) => {
    try {
        const { amount_cents } = req.body;

        // Verificar se credenciais foram configuradas
        if (!hasCredentials || !pagflex) {
            console.error('❌ Tentativa de gerar PIX sem credenciais configuradas');
            return res.status(503).json({
                ok: false,
                error: 'Servidor em modo de teste. Configure as credenciais do PagFlex no arquivo .env'
            });
        }

        // Validar valor
        const validation = validateDonationAmount(amount_cents);
        if (!validation.valid) {
            return res.status(400).json({
                ok: false,
                error: validation.error
            });
        }

        console.log(`📝 Gerando PIX de R$ ${(amount_cents / 100).toFixed(2)}...`);

        // Criar transação no PagFlex
        const result = await pagflex.createPixTransaction(amount_cents, {
            description: `Doação para Orfanato Santa Clara - R$ ${(amount_cents / 100).toFixed(2)}`,
            metadata: {
                source: 'website',
                timestamp: new Date().toISOString()
            }
        });

        if (!result.success) {
            console.error('❌ Erro ao criar transação:', result.error);
            return res.status(500).json({
                ok: false,
                error: result.error.message || 'Erro ao gerar PIX'
            });
        }

        const transaction = result.data;

        // Extrair código PIX
        let pixCode = pagflex.extractPixCode(transaction);

        // Extrair ou gerar QR Code SVG
        let pixSvg = pagflex.extractQrCodeSvg(transaction);

        // Se o PagFlex não retornou o QR Code, gerar localmente
        if (!pixSvg && pixCode) {
            try {
                pixSvg = await generateQRCodeSVG(pixCode);
            } catch (error) {
                console.error('⚠️ Erro ao gerar QR Code localmente:', error.message);
            }
        }

        // Extrair ID da transação
        const txid = transaction.id ||
            transaction.transaction_id ||
            transaction.txid ||
            `tx_${Date.now()}`;

        // Armazenar transação localmente
        transactions.set(txid, {
            id: txid,
            amount_cents,
            pixCode,
            pixSvg,
            status: 'pending',
            created_at: new Date().toISOString(),
            pagflex_data: transaction
        });

        console.log(`✅ PIX gerado com sucesso! ID: ${txid}`);

        // Retornar resposta
        res.json({
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
        console.error('❌ Erro inesperado:', error);
        res.status(500).json({
            ok: false,
            error: 'Erro interno do servidor'
        });
    }
});

/**
 * GET /api/status?txid=xxx
 * Consulta o status de uma transação
 */
app.get('/api/status', async (req, res) => {
    try {
        const { txid } = req.query;

        if (!txid) {
            return res.status(400).json({
                ok: false,
                error: 'ID da transação é obrigatório'
            });
        }

        // Buscar transação local
        const localTransaction = transactions.get(txid);

        if (!localTransaction) {
            return res.status(404).json({
                ok: false,
                error: 'Transação não encontrada'
            });
        }

        // Consultar status no PagFlex
        const result = await pagflex.getTransactionStatus(txid);

        let status = 'pending';

        if (result.success) {
            const remoteStatus = result.data?.status ||
                result.data?.state ||
                result.data?.payment_status;

            // Normalizar status
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

            // Atualizar status local
            localTransaction.status = status;
            localTransaction.last_check = new Date().toISOString();
            transactions.set(txid, localTransaction);
        }

        res.json({
            ok: true,
            status: status,
            data: {
                status: status,
                txid: txid,
                amount_cents: localTransaction.amount_cents
            }
        });

    } catch (error) {
        console.error('❌ Erro ao consultar status:', error);
        res.status(500).json({
            ok: false,
            error: 'Erro ao consultar status'
        });
    }
});

/**
 * GET /api/health
 * Health check da API
 */
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        service: 'Orfanato Santa Clara - API',
        status: 'online',
        timestamp: new Date().toISOString(),
        transactions_count: transactions.size
    });
});

// Rota raiz serve o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log('🏥 Orfanato Santa Clara - API');
    console.log('=================================');
    console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
    console.log(`🔑 PagFlex configurado`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('=================================');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Erro não tratado:', error);
});
