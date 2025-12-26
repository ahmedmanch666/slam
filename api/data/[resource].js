const { initDb, getDb } = require('../_lib/db');
const { verifyToken } = require('../_lib/jwt');
const { json, send } = require('../_lib/http');
const handlers = require('../_lib/data_handlers');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return send(res, 204);

    try {
        await initDb();

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json(res, 401, { error: 'Unauthorized' });
        }

        const token = authHeader.slice(7);
        const payload = verifyToken(token, 'access');
        if (!payload) return json(res, 401, { error: 'Invalid Token' });

        const userId = payload.sub;
        const db = getDb();

        // resource comes from filename [resource].js dynamic route in Vercel
        // but since we might use this in local dev or depending on structure, we check query.
        const { resource } = req.query;

        if (!resource || !handlers[resource]) {
            return json(res, 404, { error: 'Resource not found' });
        }

        let body = {};
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            body = await parseBody(req);
        }

        const handler = handlers[resource];
        const result = await handler(db, userId, req.method, body, req.query);

        if (!result) {
            return json(res, 405, { error: 'Method Not Allowed' });
        }

        return json(res, result.status, result.data);

    } catch (err) {
        console.error('API Error:', err);
        return json(res, 500, { error: 'Server Error', details: err.message });
    }
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
        });
        req.on('error', reject);
    });
}
