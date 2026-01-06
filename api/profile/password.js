const { verifyToken } = require('../_lib/jwt');
const { json } = require('../_lib/http');
const { getPool } = require('../_lib/db');
const { hashPassword, verifyPassword } = require('../_lib/password');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    if (req.method !== 'PUT') {
        return json(res, 405, { error: 'Method not allowed' });
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

        const body = await parseBody(req);
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return json(res, 400, { error: 'كل الحقول مطلوبة' });
        }

        if (newPassword.length < 8) {
            return json(res, 400, { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
        }

        // Get current user
        const [rows] = await pool.execute(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        if (!rows[0]) {
            return json(res, 404, { error: 'User not found' });
        }

        // Verify current password
        const isValid = verifyPassword(currentPassword, rows[0].password_hash);
        if (!isValid) {
            return json(res, 401, { error: 'كلمة المرور الحالية غير صحيحة' });
        }

        // Hash new password and update
        const newHash = hashPassword(newPassword);
        await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [newHash, userId]
        );

        return json(res, 200, { success: true });

    } catch (err) {
        console.error('Password Change Error:', err);
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
