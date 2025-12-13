/**
 * Serverless Function - GET /api/health
 * Health check da API
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

    const hasCredentials = process.env.PAGFLEX_SECRET_KEY &&
        process.env.PAGFLEX_COMPANY_ID;

    return res.status(200).json({
        ok: true,
        service: 'Orfanato Santa Clara - API',
        status: 'online',
        credentials_configured: hasCredentials,
        timestamp: new Date().toISOString()
    });
};
