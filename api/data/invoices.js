const { initDb, getDb } = require('../_lib/db');
const { verifyToken } = require('../_lib/jwt');
const { json, send } = require('../_lib/http');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return send(res, 204);

    try {
        await initDb();
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return json(res, 401, { error: 'Unauthorized' });
        const token = authHeader.slice(7);
        if (!verifyToken(token, 'access')) return json(res, 401, { error: 'Invalid Token' });

        const db = getDb();

        if (req.method === 'GET') {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const tenderId = url.searchParams.get('tender_id');
            // If tenderId is provided, filter by it. If not, maybe return all user's invoices?
            // For now, let's require tender_id to keep it scoped.
            if (!tenderId) return json(res, 400, { error: 'Missing tender_id' });

            const result = await db.execute({
                sql: 'SELECT * FROM invoices WHERE tender_id = ? ORDER BY date DESC',
                args: [tenderId]
            });
            return json(res, 200, { items: result.rows });
        }

        if (req.method === 'POST') {
            const body = await parseBody(req);
            const { id, tender_id, date, amount, quantity, vat_amount, details } = body;

            if (!id || !tender_id) return json(res, 400, { error: 'Missing required fields' });

            const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;

            await db.execute({
                sql: `INSERT OR REPLACE INTO invoices (id, tender_id, date, amount, quantity, vat_amount, details, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, tender_id, date || Date.now(), amount || 0, quantity || 0, vat_amount || 0, detailsStr || '{}', Date.now()]
            });
            return json(res, 201, { success: true, id });
        }

        if (req.method === 'DELETE') {
            const body = await parseBody(req);
            if (!body.id) return json(res, 400, { error: 'Missing ID' });
            await db.execute({ sql: 'DELETE FROM invoices WHERE id = ?', args: [body.id] });
            return json(res, 200, { success: true });
        }

        return json(res, 405, { error: 'Method Not Allowed' });
    } catch (err) {
        console.error('Invoices API Error:', err);
        return json(res, 500, { error: err.message });
    }
};

function parseBody(req) {
    return new Promise((r) => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d || '{}'))); });
}
