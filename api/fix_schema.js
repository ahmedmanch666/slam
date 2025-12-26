const { getDb, initDb } = require('./_lib/db');
const { json } = require('./_lib/http');

module.exports = async (req, res) => {
    try {
        await initDb();
        const db = getDb();

        const updates = [
            'ALTER TABLE companies ADD COLUMN sector TEXT',
            'ALTER TABLE companies ADD COLUMN phone2 TEXT'
        ];

        const results = [];
        for (const sql of updates) {
            try {
                await db.execute(sql);
                results.push(`Success: ${sql}`);
            } catch (e) {
                results.push(`Ignored (${e.message}): ${sql}`);
            }
        }

        return json(res, 200, {
            message: "Schema update attempted",
            results
        });
    } catch (err) {
        return json(res, 500, { error: err.message });
    }
};
