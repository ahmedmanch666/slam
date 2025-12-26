const { json } = require('./http');

const handlers = {
    companies: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return { status: 200, data: { companies: result.rows } };
        }
        if (method === 'POST') {
            const { id, name, phone, phone1, phone2, email, address, notes, sector } = body;
            if (!id || !name) return { status: 400, data: { error: 'الاسم مطلوب' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO companies (id, user_id, name, phone, phone2, email, address, notes, sector, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, userId, name, phone || phone1 || null, phone2 || null, email || null, address || null, notes || null, sector || null, Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'PUT') { // keeping PUT for compatibility though POST handles upsert
            const { id, name, phone, phone1, phone2, email, address, notes, sector } = body;
            if (!id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({
                sql: `UPDATE companies SET name = ?, phone = ?, phone2 = ?, email = ?, address = ?, notes = ?, sector = ?, updated_at = ? 
                      WHERE id = ? AND user_id = ?`,
                args: [name, phone || phone1 || null, phone2 || null, email || null, address || null, notes || null, sector || null, Date.now(), id, userId]
            });
            return { status: 200, data: { success: true } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({
                sql: 'DELETE FROM companies WHERE id = ? AND user_id = ?',
                args: [body.id, userId]
            });
            return { status: 200, data: { success: true } };
        }
    },

    tenders: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM tenders WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return { status: 200, data: { tenders: result.rows } };
        }
        if (method === 'POST') {
            const {
                id, company_id, title, type, status, value,
                submission_date, notes, sample_date, proof_date,
                delivery_duration, vat_status, gm_instructions, dm_instructions
            } = body;
            if (!id || !title) return { status: 400, data: { error: 'العنوان مطلوب' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO tenders (
                        id, user_id, company_id, title, type, status, value, 
                        submission_date, notes, sample_date, proof_date,
                        delivery_duration, vat_status, gm_instructions, dm_instructions,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                    id, userId, company_id || null, title, type || null, status || null, value || null,
                    submission_date || null, notes || null, sample_date || null, proof_date || null,
                    delivery_duration || null, vat_status || 'exclusive', gm_instructions || null, dm_instructions || null,
                    Date.now()
                ]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'PUT') {
            const {
                id, company_id, title, type, status, value,
                submission_date, notes, sample_date, proof_date,
                delivery_duration, vat_status, gm_instructions, dm_instructions
            } = body;
            if (!id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({
                sql: `UPDATE tenders SET 
                        company_id = ?, title = ?, type = ?, status = ?, value = ?, 
                        submission_date = ?, notes = ?, sample_date = ?, proof_date = ?,
                        delivery_duration = ?, vat_status = ?, gm_instructions = ?, dm_instructions = ?
                      WHERE id = ? AND user_id = ?`,
                args: [
                    company_id || null, title, type || null, status || null, value || null,
                    submission_date || null, notes || null, sample_date || null, proof_date || null,
                    delivery_duration || null, vat_status || null, gm_instructions || null, dm_instructions || null,
                    id, userId
                ]
            });
            return { status: 200, data: { success: true } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({
                sql: 'DELETE FROM tenders WHERE id = ? AND user_id = ?',
                args: [body.id, userId]
            });
            return { status: 200, data: { success: true } };
        }
    },

    contracts: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM contracts WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return { status: 200, data: { contracts: result.rows } };
        }
        if (method === 'POST') {
            const { id, company_id, tender_id, title, status, value, start_date, end_date, notes } = body;
            if (!id || !title) return { status: 400, data: { error: 'العنوان مطلوب' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO contracts (id, user_id, company_id, tender_id, title, status, value, start_date, end_date, notes, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, userId, company_id || null, tender_id || null, title, status || null, value || null, start_date || null, end_date || null, notes || null, Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({ sql: 'DELETE FROM contracts WHERE id = ? AND user_id = ?', args: [body.id, userId] });
            return { status: 200, data: { success: true } };
        }
    },

    tasks: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return { status: 200, data: { tasks: result.rows } };
        }
        if (method === 'POST') {
            const { id, related_type, related_id, title, priority, status, due_date, notes } = body;
            if (!id || !title) return { status: 400, data: { error: 'العنوان مطلوب' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO tasks (id, user_id, related_type, related_id, title, priority, status, due_date, notes, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, userId, related_type || null, related_id || null, title, priority || null, status || null, due_date || null, notes || null, Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({ sql: 'DELETE FROM tasks WHERE id = ? AND user_id = ?', args: [body.id, userId] });
            return { status: 200, data: { success: true } };
        }
    },

    contacts: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return { status: 200, data: { contacts: result.rows } };
        }
        if (method === 'POST') {
            const { id, company_id, name, position, phone, email, notes } = body;
            if (!id || !name) return { status: 400, data: { error: 'الاسم مطلوب' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO contacts (id, user_id, company_id, name, position, phone, email, notes, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, userId, company_id || null, name, position || null, phone || null, email || null, notes || null, Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({ sql: 'DELETE FROM contacts WHERE id = ? AND user_id = ?', args: [body.id, userId] });
            return { status: 200, data: { success: true } };
        }
    },

    followups: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const result = await db.execute({
                sql: 'SELECT * FROM followups WHERE user_id = ? ORDER BY created_at DESC',
                args: [userId]
            });
            return { status: 200, data: { followups: result.rows } };
        }
        if (method === 'POST') {
            const { id, related_type, related_id, type, date, notes } = body;
            if (!id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO followups (id, user_id, related_type, related_id, type, date, notes, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, userId, related_type || null, related_id || null, type || null, date || null, notes || null, Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await db.execute({ sql: 'DELETE FROM followups WHERE id = ? AND user_id = ?', args: [body.id, userId] });
            return { status: 200, data: { success: true } };
        }
    },

    tender_items: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const result = await db.execute({
                sql: 'SELECT * FROM tender_items WHERE tender_id = ? ORDER BY created_at ASC',
                args: [tender_id]
            });
            return { status: 200, data: { items: result.rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, name, quantity, specifications, delivery_schedule } = body;
            if (!id || !tender_id || !name) return { status: 400, data: { error: 'Missing required fields' } };
            const specsStr = typeof specifications === 'object' ? JSON.stringify(specifications) : specifications;
            const scheduleStr = typeof delivery_schedule === 'object' ? JSON.stringify(delivery_schedule) : delivery_schedule;
            await db.execute({
                sql: `INSERT OR REPLACE INTO tender_items (id, tender_id, name, quantity, specifications, delivery_schedule, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [id, tender_id, name, quantity || 0, specsStr || '{}', scheduleStr || '{}', Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'Missing ID' } };
            await db.execute({ sql: 'DELETE FROM tender_items WHERE id = ?', args: [body.id] });
            return { status: 200, data: { success: true } };
        }
    },

    tender_competitors: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const result = await db.execute({
                sql: 'SELECT * FROM tender_competitors WHERE tender_id = ? ORDER BY price ASC',
                args: [tender_id]
            });
            return { status: 200, data: { items: result.rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, name, details, price, is_winner } = body;
            if (!id || !tender_id || !name) return { status: 400, data: { error: 'Missing required fields' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO tender_competitors (id, tender_id, name, details, price, is_winner, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [id, tender_id, name, details || '', price || 0, is_winner ? 1 : 0, Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'Missing ID' } };
            await db.execute({ sql: 'DELETE FROM tender_competitors WHERE id = ?', args: [body.id] });
            return { status: 200, data: { success: true } };
        }
    },

    tender_attachments: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const result = await db.execute({
                sql: 'SELECT * FROM tender_attachments WHERE tender_id = ? ORDER BY created_at DESC',
                args: [tender_id]
            });
            return { status: 200, data: { items: result.rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, type, url, description } = body;
            if (!id || !tender_id || !url) return { status: 400, data: { error: 'Missing required fields' } };
            await db.execute({
                sql: `INSERT OR REPLACE INTO tender_attachments (id, tender_id, type, url, description, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [id, tender_id, type || 'image', url, description || '', Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'Missing ID' } };
            await db.execute({ sql: 'DELETE FROM tender_attachments WHERE id = ?', args: [body.id] });
            return { status: 200, data: { success: true } };
        }
    },

    invoices: async (db, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const result = await db.execute({
                sql: 'SELECT * FROM invoices WHERE tender_id = ? ORDER BY date DESC',
                args: [tender_id]
            });
            return { status: 200, data: { items: result.rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, date, amount, quantity, vat_amount, details } = body;
            if (!id || !tender_id) return { status: 400, data: { error: 'Missing required fields' } };
            const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
            await db.execute({
                sql: `INSERT OR REPLACE INTO invoices (id, tender_id, date, amount, quantity, vat_amount, details, created_at) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [id, tender_id, date || Date.now(), amount || 0, quantity || 0, vat_amount || 0, detailsStr || '{}', Date.now()]
            });
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'Missing ID' } };
            await db.execute({ sql: 'DELETE FROM invoices WHERE id = ?', args: [body.id] });
            return { status: 200, data: { success: true } };
        }
    }
};

module.exports = handlers;
