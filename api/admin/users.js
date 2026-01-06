const { verifyToken } = require('../_lib/jwt');
const { json } = require('../_lib/http');
const { getPool, createUser } = require('../_lib/db');
const { hashPassword } = require('../_lib/password');
const crypto = require('crypto');

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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

        const pool = getPool();

        // Check if admin
        const [adminCheck] = await pool.execute(
            'SELECT role FROM users WHERE id = ?',
            [payload.sub]
        );

        if (!adminCheck[0] || adminCheck[0].role !== 'admin') {
            return json(res, 403, { error: 'غير مصرح لك بهذه العملية' });
        }

        const body = await parseBody(req);

        // GET - List all users
        if (req.method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT id, email, name, role, permissions, avatar_url, created_at FROM users ORDER BY created_at DESC'
            );
            return json(res, 200, { users: rows });
        }

        // POST - Create new user
        if (req.method === 'POST') {
            const { email, password, name, role, permissions } = body;

            if (!email || !password) {
                return json(res, 400, { error: 'البريد وكلمة المرور مطلوبين' });
            }

            // Check if email exists
            const [existing] = await pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existing.length > 0) {
                return json(res, 400, { error: 'البريد الإلكتروني مستخدم بالفعل' });
            }

            const id = crypto.randomUUID();
            const password_hash = hashPassword(password);
            const permissionsJson = JSON.stringify(permissions || {
                dashboard: true,
                companies: true,
                tenders: true,
                contracts: true,
                tasks: true
            });

            await pool.execute(
                'INSERT INTO users (id, email, password_hash, name, role, permissions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, email, password_hash, name || null, role || 'user', permissionsJson, Date.now()]
            );

            return json(res, 201, { success: true, id });
        }

        // PUT - Update user
        if (req.method === 'PUT') {
            const { id, name, role, permissions, password } = body;

            if (!id) {
                return json(res, 400, { error: 'ID مطلوب' });
            }

            // Prevent modifying the primary admin
            if (id === 'seed_admin' && body.role && body.role !== 'admin') {
                return json(res, 400, { error: 'لا يمكن تغيير دور المدير الرئيسي' });
            }

            const permissionsJson = permissions ? JSON.stringify(permissions) : null;

            if (password) {
                const password_hash = hashPassword(password);
                await pool.execute(
                    'UPDATE users SET name = ?, role = ?, permissions = COALESCE(?, permissions), password_hash = ? WHERE id = ?',
                    [name, role, permissionsJson, password_hash, id]
                );
            } else {
                await pool.execute(
                    'UPDATE users SET name = ?, role = ?, permissions = COALESCE(?, permissions) WHERE id = ?',
                    [name, role, permissionsJson, id]
                );
            }

            return json(res, 200, { success: true });
        }

        // DELETE - Delete user
        if (req.method === 'DELETE') {
            const { id } = body;

            if (!id) {
                return json(res, 400, { error: 'ID مطلوب' });
            }

            // Prevent deleting the primary admin
            if (id === 'seed_admin') {
                return json(res, 400, { error: 'لا يمكن حذف المدير الرئيسي' });
            }

            await pool.execute('DELETE FROM users WHERE id = ?', [id]);
            return json(res, 200, { success: true });
        }

        return json(res, 405, { error: 'Method not allowed' });

    } catch (err) {
        console.error('Admin Users API Error:', err);
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
