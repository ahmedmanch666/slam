const { verifyToken } = require('../_lib/jwt');
const { json } = require('../_lib/http');
const { getPool, findUserById } = require('../_lib/db');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    try {
        // Verify auth
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return json(res, 401, { error: 'Unauthorized' });
        }

        const token = authHeader.slice(7);
        const payload = verifyToken(token, 'access');
        if (!payload) return json(res, 401, { error: 'Invalid Token' });

        const userId = payload.sub;
        const pool = getPool();

        // GET - Get profile
        if (req.method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT id, email, name, avatar_url, role, created_at FROM users WHERE id = ?',
                [userId]
            );

            if (!rows[0]) {
                return json(res, 404, { error: 'User not found' });
            }

            return json(res, 200, rows[0]);
        }

        // PUT - Update profile
        if (req.method === 'PUT') {
            const body = await parseBody(req);
            const { name, avatar_url } = body;

            await pool.execute(
                'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?',
                [name || null, avatar_url || null, userId]
            );

            return json(res, 200, { success: true });
        }

        return json(res, 405, { error: 'Method not allowed' });

    } catch (err) {
        console.error('Profile API Error:', err);
        return json(res, 500, { error: 'Server Error', details: err.message });
    }
};

function parseBody(req) {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
            try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
        });
    });
}
