const { initDb, getDb } = require('../_lib/db');
const { verifyToken } = require('../_lib/jwt');
const { json, send } = require('../_lib/http');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return send(res, 204);
    }

    try {
        await initDb();

        // Verify authentication
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json(res, 401, { error: 'غير مصرح' });
        }

        const token = authHeader.slice(7);
        const payload = verifyToken(token, 'access');
        if (!payload) {
            return json(res, 401, { error: 'Token غير صالح' });
        }

        const userId = payload.sub;
        const db = getDb();

        // GET - List all companies for user
        if (req.method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return json(res, 200, { companies: result.rows });
        }

        // POST - Create or update company (UPSERT)
        if (req.method === 'POST') {
            const body = await parseBody(req);
            const { id, name, phone, phone1, phone2, email, address, notes, sector } = body;

            if (!id || !name) {
                return json(res, 400, { error: 'الاسم مطلوب' });
            }

            await db.execute({
                sql: `INSERT OR REPLACE INTO companies (id, user_id, name, phone, phone2, email, address, notes, sector, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, userId, name, phone || phone1 || null, phone2 || null, email || null, address || null, notes || null, sector || null, Date.now()]
            });

            return json(res, 201, { success: true, id });
        }

        // PUT - Update company
        if (req.method === 'PUT') {
            const body = await parseBody(req);
            const { id, name, phone, email, address, notes } = body;

            if (!id) {
                return json(res, 400, { error: 'ID مطلوب' });
            }

            await db.execute({
                sql: `UPDATE companies SET name = ?, phone = ?, phone2 = ?, email = ?, address = ?, notes = ?, sector = ?, updated_at = ? 
                      WHERE id = ? AND user_id = ?`,
                args: [name, phone || phone1 || null, phone2 || null, email || null, address || null, notes || null, sector || null, Date.now(), id, userId]
            });

            return json(res, 200, { success: true });
        }

        // DELETE - Delete company
        if (req.method === 'DELETE') {
            const body = await parseBody(req);
            const { id } = body;

            if (!id) {
                return json(res, 400, { error: 'ID مطلوب' });
            }

            await db.execute({
                sql: 'DELETE FROM companies WHERE id = ? AND user_id = ?',
                args: [id, userId]
            });

            return json(res, 200, { success: true });
        }

        return json(res, 405, { error: 'Method not allowed' });

    } catch (err) {
        console.error('Companies API error:', err);
        return json(res, 500, { error: 'خطأ في السيرفر', details: err.message });
    }
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(data || '{}'));
            } catch {
                resolve({});
            }
        });
        req.on('error', reject);
    });
}
