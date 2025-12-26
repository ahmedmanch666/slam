
const { initDb, getDb } = require('../api/_lib/db');
require('dotenv').config();

async function checkUsers() {
    try {
        await initDb();
        const db = getDb();
        const result = await db.execute('SELECT id, email, role, created_at FROM users');

        console.log('Registered Users:');
        console.table(result.rows);
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUsers();
