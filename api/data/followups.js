const { initDb, getDb } = require('../_lib/db');
const { verifyToken } = require('../_lib/jwt');
const { json, send } = require('../_lib/http');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return send(res, 204);

    try {
        await initDb();

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json(res, 401, { error: 'غير مصرح' });
        }

        const token = authHeader.slice(7);
        const payload = verifyToken(token, 'access');
        if (!payload) return json(res, 401, { error: 'Token غير صالح' });

        const userId = payload.sub;
        const db = getDb();

        if (req.method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM followups WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return json(res, 200, { followups: result.rows });
        }

        if (req.method === 'POST') {
            const body = await parseBody(req);
            const { id, related_type, related_id, type, date, notes } = body;

            if (!id) return json(res, 400, { error: 'ID مطلوب' });

            await db.execute({
                sql: `INSERT INTO followups (id, user_id, related_type, related_id, type, date, notes) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [id, userId, related_type || null, related_id || null, type || null, date || null, notes || null]
            });

            return json(res, 201, { success: true, id });
        }

        if (req.method === 'PUT') {
            const body = await parseBody(req);
            const { id, related_type, related_id, type, date, notes } = body;
            if (!id) return json(res, 400, { error: 'ID مطلوب' });

            await db.execute({
                sql: `UPDATE followups SET related_type = ?, related_id = ?, type = ?, date = ?, notes = ? 
                      WHERE id = ? AND user_id = ?`,
                args: [related_type || null, related_id || null, type || null, date || null, notes || null, id, userId]
            });

            return json(res, 200, { success: true });
        }

        if (req.method === 'DELETE') {
            const body = await parseBody(req);
            if (!body.id) return json(res, 400, { error: 'ID مطلوب' });

            await db.execute({
                sql: 'DELETE FROM followups WHERE id = ? AND user_id = ?',
                args: [body.id, userId]
            });

            return json(res, 200, { success: true });
        }

        return json(res, 405, { error: 'Method not allowed' });

    } catch (err) {
        console.error('Followups API error:', err);
        return json(res, 500, { error: 'خطأ في السيرفر', details: err.message });
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
