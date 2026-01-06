const handlers = {
    companies: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return { status: 200, data: { companies: rows } };
        }
        if (method === 'POST') {
            const { name, phone, phone1, phone2, email, address, notes, sector } = body;
            const id = body.id || require('crypto').randomUUID();
            if (!name) return { status: 400, data: { error: 'الاسم مطلوب' } };
            await pool.execute(
                `REPLACE INTO companies (id, user_id, name, phone, phone2, email, address, notes, sector, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, userId, name, phone || phone1 || null, phone2 || null, email || null, address || null, notes || null, sector || null, Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'PUT') {
            const { id, name, phone, phone1, phone2, email, address, notes, sector } = body;
            if (!id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute(
                `UPDATE companies SET name = ?, phone = ?, phone2 = ?, email = ?, address = ?, notes = ?, sector = ?, updated_at = ? 
                 WHERE id = ? AND user_id = ?`,
                [name, phone || phone1 || null, phone2 || null, email || null, address || null, notes || null, sector || null, Date.now(), id, userId]
            );
            return { status: 200, data: { success: true } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute('DELETE FROM companies WHERE id = ? AND user_id = ?', [body.id, userId]);
            return { status: 200, data: { success: true } };
        }
    },

    tenders: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT * FROM tenders WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return { status: 200, data: { tenders: rows } };
        }
        if (method === 'POST') {
            const {
                company_id, title, type, status, value,
                submission_date, notes, sample_date, proof_date,
                delivery_duration, vat_status, gm_instructions, dm_instructions,
                include_vat, include_insurance, include_withholding,
                vat_amount, withholding_amount, insurance_amount, total_value
            } = body;
            const id = body.id || require('crypto').randomUUID();
            await pool.execute(
                `REPLACE INTO tenders (
                    id, user_id, company_id, title, type, status, value, 
                    submission_date, notes, sample_date, proof_date,
                    delivery_duration, vat_status, gm_instructions, dm_instructions,
                    include_vat, include_insurance, include_withholding,
                    vat_amount, withholding_amount, insurance_amount, total_value,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id, userId, company_id || null, title || '', type || null, status || null, value || null,
                    submission_date || null, notes || null, sample_date || null, proof_date || null,
                    delivery_duration || null, vat_status || 'exclusive', gm_instructions || null, dm_instructions || null,
                    include_vat ? 1 : 0, include_insurance ? 1 : 0, include_withholding ? 1 : 0,
                    vat_amount || null, withholding_amount || null, insurance_amount || null, total_value || null,
                    Date.now()
                ]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'PUT') {
            const {
                id, company_id, title, type, status, value,
                submission_date, notes, sample_date, proof_date,
                delivery_duration, vat_status, gm_instructions, dm_instructions,
                include_vat, include_insurance, include_withholding,
                vat_amount, withholding_amount, insurance_amount, total_value
            } = body;
            if (!id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute(
                `UPDATE tenders SET 
                    company_id = ?, title = ?, type = ?, status = ?, value = ?, 
                    submission_date = ?, notes = ?, sample_date = ?, proof_date = ?,
                    delivery_duration = ?, vat_status = ?, gm_instructions = ?, dm_instructions = ?,
                    include_vat = ?, include_insurance = ?, include_withholding = ?,
                    vat_amount = ?, withholding_amount = ?, insurance_amount = ?, total_value = ?
                 WHERE id = ? AND user_id = ?`,
                [
                    company_id || null, title, type || null, status || null, value || null,
                    submission_date || null, notes || null, sample_date || null, proof_date || null,
                    delivery_duration || null, vat_status || null, gm_instructions || null, dm_instructions || null,
                    include_vat ? 1 : 0, include_insurance ? 1 : 0, include_withholding ? 1 : 0,
                    vat_amount || null, withholding_amount || null, insurance_amount || null, total_value || null,
                    id, userId
                ]
            );
            return { status: 200, data: { success: true } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute('DELETE FROM tenders WHERE id = ? AND user_id = ?', [body.id, userId]);
            return { status: 200, data: { success: true } };
        }
    },

    contracts: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT * FROM contracts WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return { status: 200, data: { contracts: rows } };
        }
        if (method === 'POST') {
            const { company_id, tender_id, title, status, value, start_date, end_date, notes } = body;
            const id = body.id || require('crypto').randomUUID();
            if (!title) return { status: 400, data: { error: 'العنوان مطلوب' } };
            await pool.execute(
                `REPLACE INTO contracts (id, user_id, company_id, tender_id, title, status, value, start_date, end_date, notes, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, userId, company_id || null, tender_id || null, title, status || null, value || null, start_date || null, end_date || null, notes || null, Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute('DELETE FROM contracts WHERE id = ? AND user_id = ?', [body.id, userId]);
            return { status: 200, data: { success: true } };
        }
    },

    tasks: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return { status: 200, data: { tasks: rows } };
        }
        if (method === 'POST') {
            const { related_type, related_id, title, priority, status, due_date, notes } = body;
            const id = body.id || require('crypto').randomUUID();
            if (!title) return { status: 400, data: { error: 'العنوان مطلوب' } };
            await pool.execute(
                `REPLACE INTO tasks (id, user_id, related_type, related_id, title, priority, status, due_date, notes, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, userId, related_type || null, related_id || null, title, priority || null, status || null, due_date || null, notes || null, Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute('DELETE FROM tasks WHERE id = ? AND user_id = ?', [body.id, userId]);
            return { status: 200, data: { success: true } };
        }
    },

    contacts: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return { status: 200, data: { contacts: rows } };
        }
        if (method === 'POST') {
            const { id, company_id, name, position, phone, email, notes } = body;
            if (!id || !name) return { status: 400, data: { error: 'الاسم مطلوب' } };
            await pool.execute(
                `REPLACE INTO contacts (id, user_id, company_id, name, position, phone, email, notes, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, userId, company_id || null, name, position || null, phone || null, email || null, notes || null, Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute('DELETE FROM contacts WHERE id = ? AND user_id = ?', [body.id, userId]);
            return { status: 200, data: { success: true } };
        }
    },

    followups: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const [rows] = await pool.execute(
                'SELECT * FROM followups WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return { status: 200, data: { followups: rows } };
        }
        if (method === 'POST') {
            const { id, related_type, related_id, type, date, notes } = body;
            if (!id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute(
                `REPLACE INTO followups (id, user_id, related_type, related_id, type, date, notes, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, userId, related_type || null, related_id || null, type || null, date || null, notes || null, Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'ID مطلوب' } };
            await pool.execute('DELETE FROM followups WHERE id = ? AND user_id = ?', [body.id, userId]);
            return { status: 200, data: { success: true } };
        }
    },

    tender_items: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const [rows] = await pool.execute(
                'SELECT * FROM tender_items WHERE tender_id = ? ORDER BY created_at ASC',
                [tender_id]
            );
            return { status: 200, data: { items: rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, name, quantity, specifications, delivery_schedule } = body;
            if (!id || !tender_id || !name) return { status: 400, data: { error: 'Missing required fields' } };
            const specsStr = typeof specifications === 'object' ? JSON.stringify(specifications) : specifications;
            const scheduleStr = typeof delivery_schedule === 'object' ? JSON.stringify(delivery_schedule) : delivery_schedule;
            await pool.execute(
                `REPLACE INTO tender_items (id, tender_id, name, quantity, specifications, delivery_schedule, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, tender_id, name, quantity || 0, specsStr || '{}', scheduleStr || '{}', Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'Missing ID' } };
            await pool.execute('DELETE FROM tender_items WHERE id = ?', [body.id]);
            return { status: 200, data: { success: true } };
        }
    },

    tender_competitors: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const [rows] = await pool.execute(
                'SELECT * FROM tender_competitors WHERE tender_id = ? ORDER BY price ASC',
                [tender_id]
            );
            return { status: 200, data: { items: rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, name, details, price, is_winner } = body;
            if (!id || !tender_id || !name) return { status: 400, data: { error: 'Missing required fields' } };
            await pool.execute(
                `REPLACE INTO tender_competitors (id, tender_id, name, details, price, is_winner, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, tender_id, name, details || '', price || 0, is_winner ? 1 : 0, Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'Missing ID' } };
            await pool.execute('DELETE FROM tender_competitors WHERE id = ?', [body.id]);
            return { status: 200, data: { success: true } };
        }
    },

    tender_attachments: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const [rows] = await pool.execute(
                'SELECT * FROM tender_attachments WHERE tender_id = ? ORDER BY created_at DESC',
                [tender_id]
            );
            return { status: 200, data: { items: rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, type, url, description } = body;
            if (!id || !tender_id || !url) return { status: 400, data: { error: 'Missing required fields' } };
            await pool.execute(
                `REPLACE INTO tender_attachments (id, tender_id, type, url, description, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [id, tender_id, type || 'image', url, description || '', Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            const deleteId = body.id || query.id;
            console.log('[tender_attachments DELETE] Received request:', { bodyId: body.id, queryId: query.id, deleteId });
            if (!deleteId) {
                console.log('[tender_attachments DELETE] ERROR: Missing ID');
                return { status: 400, data: { error: 'Missing ID' } };
            }
            try {
                await pool.execute('DELETE FROM tender_attachments WHERE id = ?', [deleteId]);
                console.log('[tender_attachments DELETE] Success');
                return { status: 200, data: { success: true, deletedId: deleteId } };
            } catch (dbErr) {
                console.error('[tender_attachments DELETE] DB Error:', dbErr);
                return { status: 500, data: { error: 'Database error', details: dbErr.message } };
            }
        }
    },

    invoices: async (pool, userId, method, body, query) => {
        if (method === 'GET') {
            const { tender_id } = query;
            if (!tender_id) return { status: 400, data: { error: 'Missing tender_id' } };
            const [rows] = await pool.execute(
                'SELECT * FROM invoices WHERE tender_id = ? ORDER BY date DESC',
                [tender_id]
            );
            return { status: 200, data: { items: rows } };
        }
        if (method === 'POST') {
            const { id, tender_id, date, amount, quantity, vat_amount, details } = body;
            if (!id || !tender_id) return { status: 400, data: { error: 'Missing required fields' } };
            const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
            await pool.execute(
                `REPLACE INTO invoices (id, tender_id, date, amount, quantity, vat_amount, details, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, tender_id, date || Date.now(), amount || 0, quantity || 0, vat_amount || 0, detailsStr || '{}', Date.now()]
            );
            return { status: 201, data: { success: true, id } };
        }
        if (method === 'DELETE') {
            if (!body.id) return { status: 400, data: { error: 'Missing ID' } };
            await pool.execute('DELETE FROM invoices WHERE id = ?', [body.id]);
            return { status: 200, data: { success: true } };
        }
    }
};

module.exports = handlers;
