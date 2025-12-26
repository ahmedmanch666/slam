const { getDb, initDb } = require('./_lib/db');
const { json } = require('./_lib/http');

module.exports = async (req, res) => {
    try {
        await initDb();
        const db = getDb();

        const updates = [
            // 1. Update Tenders Table columns
            'ALTER TABLE tenders ADD COLUMN sample_date INTEGER',        // تاريخ اعتماد العينة
            'ALTER TABLE tenders ADD COLUMN proof_date INTEGER',         // تاريخ اعتماد البروفة
            'ALTER TABLE tenders ADD COLUMN delivery_duration TEXT',     // مدة التوريد المسموحة
            'ALTER TABLE tenders ADD COLUMN vat_status TEXT',            // حالة الضريبة (شامل/غير شامل)
            'ALTER TABLE tenders ADD COLUMN gm_instructions TEXT',       // تعليمات المدير العام
            'ALTER TABLE tenders ADD COLUMN dm_instructions TEXT',       // تعليمات المدير المباشر

            // 2. Create Tender Items Table (Details & Specs)
            `CREATE TABLE IF NOT EXISTS tender_items (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL,
                name TEXT NOT NULL,
                quantity INTEGER,
                specifications TEXT, -- JSON stores: layers, flute_type, paper_type, grammage, print_colors, carton_type
                delivery_schedule TEXT, -- JSON stores: annual schedule info
                created_at INTEGER DEFAULT (unixepoch() * 1000),
                FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
            )`,

            // 3. Create Tender Competitors Table
            `CREATE TABLE IF NOT EXISTS tender_competitors (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL,
                name TEXT NOT NULL,
                details TEXT,
                price REAL,
                is_winner INTEGER DEFAULT 0,
                created_at INTEGER DEFAULT (unixepoch() * 1000),
                FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
            )`,

            // 4. Create Tender Attachments/Images Table
            `CREATE TABLE IF NOT EXISTS tender_attachments (
                id TEXT PRIMARY KEY,
                tender_id TEXT NOT NULL,
                type TEXT, -- 'image', 'file'
                url TEXT NOT NULL,
                description TEXT,
                created_at INTEGER DEFAULT (unixepoch() * 1000),
                FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE
            )`,
            // 5. Create Invoices Table
            `CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY,
                tender_id TEXT,
                date INTEGER,
                amount REAL,
                quantity INTEGER,
                vat_amount REAL,
                details TEXT, -- JSON for extra invoice details
                created_at INTEGER DEFAULT (unixepoch() * 1000),
                FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE SET NULL
            )`
        ];

        const results = [];
        for (const sql of updates) {
            try {
                await db.execute(sql);
                results.push(`Success: ${sql.substring(0, 50)}...`);
            } catch (e) {
                // Ignore "duplicate column" errors
                if (e.message.includes('duplicate column')) {
                    results.push(`Skipped (exists): ${sql.substring(0, 50)}...`);
                } else {
                    results.push(`Error: ${e.message} in ${sql}`);
                }
            }
        }

        return json(res, 200, {
            message: "Advanced Tenders Schema update attempted",
            results
        });
    } catch (err) {
        return json(res, 500, { error: err.message });
    }
};
