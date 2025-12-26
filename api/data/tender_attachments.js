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
            if (!tenderId) return json(res, 400, { error: 'Missing tender_id' });

            const result = await db.execute({
                sql: 'SELECT * FROM tender_attachments WHERE tender_id = ? ORDER BY created_at DESC',
                args: [tenderId]
            });
            return json(res, 200, { items: result.rows });
        }

        if (req.method === 'POST') {
            const body = await parseBody(req);
            const { id, tender_id, type, url, description } = body;

            if (!id || !tender_id || !url) return json(res, 400, { error: 'Missing required fields' });

            await db.execute({
                sql: `INSERT OR REPLACE INTO tender_attachments (id, tender_id, type, url, description, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [id, tender_id, type || 'image', url, description || '', Date.now()]
            });
            return json(res, 201, { success: true, id });
        }

        if (req.method === 'DELETE') {
            const body = await parseBody(req);
            if (!body.id) return json(res, 400, { error: 'Missing ID' });
            await db.execute({ sql: 'DELETE FROM tender_attachments WHERE id = ?', args: [body.id] });
            return json(res, 200, { success: true });
        }

        return json(res, 405, { error: 'Method Not Allowed' });
    } catch (err) {
        console.error('Attachments API Error:', err);
        return json(res, 500, { error: err.message });
    }
};

function parseBody(req) {
    return new Promise((r) => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d || '{}'))); });
}
