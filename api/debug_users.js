const { initDb, getDb } = require('./_lib/db');
const { json } = require('../_lib/http');

module.exports = async (req, res) => {
    try {
        await initDb();
        const db = getDb();
        const result = await db.execute('SELECT id, email, role, created_at FROM users');

        return json(res, 200, {
            users: result.rows,
            count: result.rows.length,
            message: "This is a debug endpoint. Please remove after use."
        });
    } catch (err) {
        return json(res, 500, { error: err.message });
    }
};
