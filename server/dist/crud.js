"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crudRoutes = crudRoutes;
const db_1 = require("./db");
const zod_1 = require("zod");
const auth_1 = require("./auth");
function id() { return (globalThis.crypto?.randomUUID?.() || `id_${Math.random().toString(16).slice(2)}_${Date.now()}`); }
async function crudRoutes(app) {
    const companySchema = zod_1.z.object({
        id: zod_1.z.string().optional(),
        name: zod_1.z.string().min(1, 'الاسم مطلوب'),
        sector: zod_1.z.string().nullable().optional(),
        address: zod_1.z.string().nullable().optional(),
        phone1: zod_1.z.string().nullable().optional(),
        phone2: zod_1.z.string().nullable().optional(),
        email: zod_1.z.string().email().nullable().optional(),
        website: zod_1.z.string().nullable().optional(),
        notes: zod_1.z.string().nullable().optional()
    });
    app.get('/companies', (req, reply) => {
        (0, auth_1.requireAuth)(req, reply);
        const rows = db_1.db.prepare('SELECT * FROM companies ORDER BY name COLLATE NOCASE').all();
        reply.send(rows);
    });
    app.post('/companies', (req, reply) => {
        (0, auth_1.requireAuth)(req, reply);
        const body = companySchema.parse(req.body);
        const _id = body.id || id();
        const ts = (0, db_1.now)();
        db_1.db.prepare('INSERT OR REPLACE INTO companies (id,name,sector,address,phone1,phone2,email,website,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
            .run(_id, body.name, body.sector, body.address, body.phone1, body.phone2, body.email, body.website, body.notes, ts, ts);
        reply.send({ id: _id });
    });
    app.delete('/companies/:id', (req, reply) => {
        (0, auth_1.requireAuth)(req, reply);
        const id = req.params.id;
        db_1.db.prepare('DELETE FROM companies WHERE id = ?').run(id);
        reply.send({ ok: true });
    });
    // TODO: Implement CRUD for contacts, tenders, contracts, tasks, followups similarly
}
