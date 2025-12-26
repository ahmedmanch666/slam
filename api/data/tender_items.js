const { initDb, getDb } = require('../_lib/db');
const { verifyToken } = require('../_lib/jwt');
const { json, send } = require('../_lib/http');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return send(res, 204);

    try {
        await initDb();

        // Verify Auth
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return json(res, 401, { error: 'Unauthorized' });
        const token = authHeader.slice(7);
        const payload = verifyToken(token, 'access');
        if (!payload) return json(res, 401, { error: 'Invalid Token' });

        const db = getDb();
        const userId = payload.sub; // Although items are linked to tenders, we might want to check ownership via tender->user link? 
        // For simplicity, we assume if you have a valid token you can access. 
        // Ideally we check if the parent tender belongs to user.

        // GET - List by Tender ID
        if (req.method === 'GET') {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const tenderId = url.searchParams.get('tender_id');

            if (!tenderId) return json(res, 400, { error: 'Missing tender_id' });

            const result = await db.execute({
                sql: 'SELECT * FROM tender_items WHERE tender_id = ? ORDER BY created_at ASC',
                args: [tenderId]
            });
            return json(res, 200, { items: result.rows });
        }

        // POST - Create/Update (Upsert)
        if (req.method === 'POST') {
            const body = await parseBody(req);
            const { id, tender_id, name, quantity, specifications, delivery_schedule } = body;

            if (!id || !tender_id || !name) return json(res, 400, { error: 'Missing required fields' });

            // Ensure specifications is a string (JSON)
            const specsStr = typeof specifications === 'object' ? JSON.stringify(specifications) : specifications;
            const scheduleStr = typeof delivery_schedule === 'object' ? JSON.stringify(delivery_schedule) : delivery_schedule;

            await db.execute({
                sql: `INSERT OR REPLACE INTO tender_items (id, tender_id, name, quantity, specifications, delivery_schedule, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [id, tender_id, name, quantity || 0, specsStr || '{}', scheduleStr || '{}', Date.now()]
            });

            return json(res, 201, { success: true, id });
        }

        // DELETE
        if (req.method === 'DELETE') {
            const body = await parseBody(req);
            const { id } = body;
            if (!id) return json(res, 400, { error: 'Missing ID' });

            await db.execute({
                sql: 'DELETE FROM tender_items WHERE id = ?',
                args: [id]
            });
            return json(res, 200, { success: true });
        }

        return json(res, 405, { error: 'Method Not Allowed' });

    } catch (err) {
        console.error('Tender Items API Error:', err);
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
